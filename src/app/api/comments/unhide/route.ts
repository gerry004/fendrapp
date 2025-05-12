import { NextRequest, NextResponse } from 'next/server';
import { unhideComment, updateCommentHiddenStatus } from '@/app/lib/comments';
import { getSession } from '@/app/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { commentId, accessToken } = await request.json();
    
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
      // First, unhide the comment on Instagram
      const success = await unhideComment(commentId, accessToken);
      
      if (success) {
        // If successful, update the hidden status in our database
        await updateCommentHiddenStatus(session.userId, commentId, false);
      }
      
      return NextResponse.json({ success });
    } catch (apiError: any) {
      console.error('Facebook API error unhiding comment:', apiError);
      return NextResponse.json(
        { error: apiError.message || 'Failed to unhide comment', details: apiError },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in unhide comment API:', error);
    return NextResponse.json(
      { error: 'Failed to unhide comment' },
      { status: 500 }
    );
  }
} 