import { NextRequest, NextResponse } from 'next/server';
import { getSession, UserSession } from '@/app/lib/session';
import { prisma } from '@/app/prismaClient';

export async function GET(request: NextRequest) {
  // Get the current session
  const session = getSession(request);
  
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  // Create a test value for settings
  const testSetting = 'AUTO_DELETE';
  
  try {
    // Update user settings in the database instead of session
    await prisma.user.update({
      where: { id: session.userId },
      data: { settings: testSetting },
    });
    
    // Return success response
    return NextResponse.json({ 
      success: true,
      message: `Settings updated to ${testSetting}`
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' }, 
      { status: 500 }
    );
  }
} 