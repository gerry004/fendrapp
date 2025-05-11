import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/prismaClient';
import { getServerSession } from '@/app/lib/session';

export async function GET(request: NextRequest) {
  // Get session data
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Fetch user data from database using the userId from session
    const userData = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        username: true,
        settings: true,
        // Add other user fields you need, but NOT access_token for security
      }
    });
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
} 