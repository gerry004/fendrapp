import { NextRequest, NextResponse } from 'next/server';
import { unhideComment } from '@/app/lib/comments';

export async function POST(request: NextRequest) {
  try {
    const { commentId, accessToken } = await request.json();
    
    if (!commentId || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    try {
      const success = await unhideComment(commentId, accessToken);
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