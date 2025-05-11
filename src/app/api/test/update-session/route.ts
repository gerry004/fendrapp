import { NextRequest, NextResponse } from 'next/server';
import { getSession, setSession, UserSession } from '@/app/lib/session';

export async function GET(request: NextRequest) {
  // Get the current session
  const session = getSession(request);
  
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  // Create a test value for settings
  const testSetting = 'AUTO_DELETE';
  
  // Update session with test setting
  const updatedSession: UserSession = {
    ...session,
    settings: testSetting
  };
  
  // Create response with updated session
  const response = NextResponse.json({ 
    success: true,
    message: `Settings updated to ${testSetting}`
  });
  
  // Set the updated session cookie and return
  return setSession(response, updatedSession);
} 