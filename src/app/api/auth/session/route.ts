import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { prisma } from '@/app/prismaClient';

export async function GET(request: NextRequest) {
  const session = getSession(request);
  
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  
  try {
    // Get additional user data from database
    const userData = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        settings: true,
      }
    });
    
    // Return enhanced session data
    return NextResponse.json({ 
      user: {
        ...session,
        name: userData?.username,
        settings: userData?.settings
      } 
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    // Return basic session data if database query fails
    return NextResponse.json({ user: session });
  }
} 