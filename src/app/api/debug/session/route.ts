import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';
import { prisma } from '@/app/prismaClient';

export async function GET(request: NextRequest) {
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
    session,
    dbUser,
    settingsInSession: session?.settings,
    settingsInDb: dbUser?.settings
  });
} 