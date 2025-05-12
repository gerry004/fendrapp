import { NextRequest, NextResponse } from 'next/server';
import { deleteComment } from '@/app/lib/comments';

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
    
    try {
      const success = await deleteComment(commentId, accessToken);
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