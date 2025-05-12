import { NextRequest, NextResponse } from 'next/server';
import { deleteComment } from '@/app/lib/comments';
import { getSession } from '@/app/lib/session';
import { prisma } from '@/app/prismaClient';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');
    const accessToken = searchParams.get('accessToken');
    
    if (!commentId || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Get the user session to get the userId
    const session = getSession(request);
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    try {
      // First, delete the comment on Instagram
      const success = await deleteComment(commentId, accessToken);
      
      if (success) {
        // If successful, delete the comment from our database (or mark as deleted if we want to keep records)
        try {
          await prisma.analyzedComment.delete({
            where: {
              userId_commentId: {
                userId: session.userId,
                commentId: commentId,
              },
            },
          });
        } catch (dbError) {
          console.error('Error removing comment from database:', dbError);
          // Continue even if database deletion fails
        }
      }
      
      return NextResponse.json({ success });
    } catch (apiError: any) {
      console.error('Facebook API error deleting comment:', apiError);
      return NextResponse.json(
        { error: apiError.message || 'Failed to delete comment', details: apiError },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in delete comment API:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
} 