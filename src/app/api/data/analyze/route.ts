import { NextRequest, NextResponse } from 'next/server';
import { analyzeComment } from '@/app/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { comment } = await request.json();
    
    if (!comment || typeof comment !== 'string') {
      return NextResponse.json(
        { error: 'Invalid comment provided' },
        { status: 400 }
      );
    }

    const isHarmful = await analyzeComment(comment);
    
    return NextResponse.json({ 
      isHarmful,
      analyzed: true 
    });
  } catch (error) {
    console.error('Error analyzing comment:', error);
    return NextResponse.json(
      { error: 'Failed to analyze comment' },
      { status: 500 }
    );
  }
} 