import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { prisma } from '@/app/prismaClient';

export async function POST(request: NextRequest) {
  try {
    const session = getSession(request);
    
    if (!session || !session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { commentId, mediaId, text, username, isHarmful } = await request.json();
    
    if (!commentId || typeof isHarmful !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid comment data provided' },
        { status: 400 }
      );
    }
    
    // Save the analyzed comment
    await prisma.analyzedComment.upsert({
      where: {
        userId_commentId: {
          userId: session.userId,
          commentId,
        },
      },
      update: {
        isHarmful,
      },
      create: {
        userId: session.userId,
        commentId,
        mediaId,
        text,
        username,
        isHarmful,
      },
    });
    
    return NextResponse.json({ 
      success: true,
      saved: true
    });
  } catch (error) {
    console.error('Error saving comment analysis:', error);
    return NextResponse.json(
      { error: 'Failed to save comment analysis' },
      { status: 500 }
    );
  }
} 