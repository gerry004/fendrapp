import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { prisma } from '@/app/prismaClient';
import {
  getInstagramBusinessAccountIds,
  getAllComments,
  type Comment
} from '@/app/lib/comments';

export async function GET(request: NextRequest) {
  const session = getSession(request);
  
  if (!session || !session.accessToken || !session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // 1. Get Instagram business account IDs
    const instagramIds = await getInstagramBusinessAccountIds(session.accessToken);
    
    if (instagramIds.length === 0) {
      return NextResponse.json({ 
        comments: [],
        message: "No Instagram business accounts found" 
      }, { status: 200 });
    }
    
    // 2. Get all comments from Instagram API
    const commentsPromises = instagramIds.map(instagramId => 
      getAllComments(instagramId, session.accessToken)
    );
    
    const commentsArrays = await Promise.all(commentsPromises);
    const instagramComments = commentsArrays.flat();
    
    // 3. Get existing analyzed comments from the database
    const existingAnalyzedComments = await prisma.analyzedComment.findMany({
      where: {
        userId: session.userId,
        commentId: {
          in: instagramComments.map(c => c.id)
        }
      }
    });
    
    // Create a map of already analyzed comment IDs
    const analyzedCommentsMap = new Map();
    existingAnalyzedComments.forEach(comment => {
      analyzedCommentsMap.set(comment.commentId, comment.isHarmful);
    });
    
    // 4. Analyze comments that don't exist in the database
    const commentsToAnalyze = instagramComments.filter(comment => 
      !analyzedCommentsMap.has(comment.id)
    );
    
    // Process new comments if any
    if (commentsToAnalyze.length > 0) {
      for (const comment of commentsToAnalyze) {
        try {
          // Analyze the comment text
          const response = await fetch(`${request.nextUrl.origin}/api/data/analyze`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ comment: comment.text }),
          });
          
          if (!response.ok) {
            console.error(`Failed to analyze comment ${comment.id}`);
            continue;
          }
          
          const analyzeData = await response.json();
          const isHarmful = analyzeData.isHarmful;
          
          // Save to database
          await prisma.analyzedComment.create({
            data: {
              userId: session.userId,
              commentId: comment.id,
              mediaId: comment.mediaId,
              text: comment.text,
              username: comment.username,
              isHarmful
            }
          });
          
          // Add to map for returning in response
          analyzedCommentsMap.set(comment.id, isHarmful);
          
        } catch (error) {
          console.error(`Error processing comment ${comment.id}:`, error);
        }
      }
    }
    
    // 5. Combine all data for response
    const enhancedComments = instagramComments.map(comment => ({
      ...comment,
      isHarmful: analyzedCommentsMap.has(comment.id) ? analyzedCommentsMap.get(comment.id) : undefined
    }));
    
    return NextResponse.json({
      comments: enhancedComments,
      totalComments: enhancedComments.length,
      newlyAnalyzed: commentsToAnalyze.length
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error processing comments data:', error);
    return NextResponse.json({ error: 'Failed to process data' }, { status: 500 });
  }
} 