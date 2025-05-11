import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { prisma } from '@/app/prismaClient';

export async function GET(request: NextRequest) {
  // Get the current session
  const session = getSession(request);
  
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  try {
    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { id: session.userId }
    });
    
    // Return both session and database data for debugging
    return NextResponse.json({
      session,
      dbUser
    });
  } catch (error) {
    console.error('Error getting debug info:', error);
    return NextResponse.json(
      { error: 'Failed to get debug info' }, 
      { status: 500 }
    );
  }
} 