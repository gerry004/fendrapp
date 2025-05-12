import { NextRequest, NextResponse } from 'next/server';
import { hideComment } from '@/app/lib/comments';

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
      const success = await hideComment(commentId, accessToken);
      return NextResponse.json({ success });
    } catch (apiError: any) {
      console.error('Facebook API error hiding comment:', apiError);
      return NextResponse.json(
        { error: apiError.message || 'Failed to hide comment', details: apiError },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in hide comment API:', error);
    return NextResponse.json(
      { error: 'Failed to hide comment' },
      { status: 500 }
    );
  }
} 