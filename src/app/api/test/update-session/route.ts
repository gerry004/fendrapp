import { NextRequest, NextResponse } from 'next/server';
import { getSession, setSession, UserSession } from '@/app/lib/session';

export async function GET(request: NextRequest) {
  // Get the current session
  const session = getSession(request);
  
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  try {
    // Create a test value for settings
    const testSetting = 'AUTO_DELETE';
    
    // Create a new response object
    const response = NextResponse.json({ 
      success: true,
      oldSession: session,
      newSetting: testSetting 
    });
    
    // Update the user session with the test setting
    const updatedSession: UserSession = {
      ...session,
      settings: testSetting
    };
    
    // Set the updated session cookie
    return setSession(response, updatedSession);
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
} 