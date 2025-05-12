import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { prisma } from '@/app/prismaClient';

export async function GET(request: NextRequest) {
  try {
    const session = getSession(request);
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.userId;
    
    // Get all analyzed comments for this user
    const analyzedComments = await prisma.analyzedComment.findMany({
      where: {
        userId,
      },
      select: {
        commentId: true,
        isHarmful: true,
      },
    });
    
    // Create a map of comment IDs to their harmful status for quick lookup
    const analyzedMap = analyzedComments.reduce(
      (acc: Record<string, boolean>, comment) => {
        acc[comment.commentId] = comment.isHarmful;
        return acc;
      }, 
      {}
    );
    
    return NextResponse.json({
      analyzedComments: analyzedMap,
      count: analyzedComments.length
    });
  } catch (error) {
    console.error('Error fetching analyzed comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analyzed comments' },
      { status: 500 }
    );
  }
} 