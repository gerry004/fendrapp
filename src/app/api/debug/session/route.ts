import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { prisma } from '@/app/prismaClient';

export async function GET(request: NextRequest) {
  try {
    // Get all cookies
    const allCookies = Object.fromEntries(
      request.cookies.getAll().map(cookie => [cookie.name, cookie.value])
    );
    
    // Get the current session
    const session = getSession(request);
    
    // Get user from database if logged in
    let dbUser = null;
    if (session) {
      dbUser = await prisma.user.findUnique({
        where: { id: session.userId }
      });
    }
    
    // Return debug information
    return NextResponse.json({
      allCookies,
      parsedSession: session,
      dbUser,
      hasSettings: session ? !!session.settings : false,
      settingsValue: session ? session.settings : null,
      settingsType: session ? typeof session.settings : null
    });
  } catch (error) {
    console.error('Error getting debug info:', error);
    return NextResponse.json(
      { error: 'Failed to get debug info', details: error instanceof Error ? error.message : String(error) }, 
      { status: 500 }
    );
  }
} 