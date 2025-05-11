import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { prisma } from '@/app/prismaClient';

export async function POST(request: NextRequest) {
  // Get the current session
  const session = getSession(request);
  
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  try {
    // Parse the request body
    const body = await request.json();
    const { settings } = body;
    
    // Validate settings value
    if (!settings || !['AUTO_DELETE', 'AUTO_HIDE', 'MANUAL_REVIEW'].includes(settings)) {
      return NextResponse.json(
        { error: 'Invalid settings value' }, 
        { status: 400 }
      );
    }
    
    // Update user settings in the database
    await prisma.user.update({
      where: { id: session.userId },
      data: { settings },
    });
    
    // Create a response object with success message
    const response = NextResponse.json({ success: true });
    
    // No need to update session as settings are no longer stored there
    return response;
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' }, 
      { status: 500 }
    );
  }
} 