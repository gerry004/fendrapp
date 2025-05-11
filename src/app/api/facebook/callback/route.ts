import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/prismaClient';
import { setSession, UserSession } from '@/app/lib/session';
import { getShortLivedToken, getLongLivedToken, getUserNameAndId } from '@/app/lib/auth';

// Add CommentModeration type to match Prisma schema
type UserWithSettings = {
  id: string;
  username: string;
  access_token: string;
  settings?: 'AUTO_DELETE' | 'AUTO_HIDE' | 'MANUAL_REVIEW' | null;
};

const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.BASE_URL_PRODUCTION : process.env.BASE_URL_DEVELOPMENT;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  // Exchange code for short-lived access token
  const shortLivedToken = await getShortLivedToken(code);

  if (!shortLivedToken) {
    return NextResponse.json({ error: 'Failed to retrieve short-lived access token' }, { status: 500 });
  }

  // Exchange for long-lived access token
  const longLivedToken = await getLongLivedToken(shortLivedToken);

  if (!longLivedToken) {
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve long-lived access token',
    }, { status: 500 });
  }

  // Fetch the Facebook username and id
  const userInfo = await getUserNameAndId(longLivedToken);

  if (!userInfo) {
    return NextResponse.json({ error: 'Failed to retrieve Facebook username' }, { status: 500 });
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { id: userInfo.id } }) as UserWithSettings | null;
  let userSettings = null;
  
  if (existingUser) {
    // Update existing user
    await prisma.user.update({
      where: { id: userInfo.id },
      data: { access_token: longLivedToken },
    });
    userSettings = existingUser.settings;
  } else {
    // Create new user
    await prisma.user.create({
      data: { id: userInfo.id, username: userInfo.name, access_token: longLivedToken },
    });
  }

  // Redirect to onboard if no settings, otherwise to dashboard
  const redirectPath = userSettings ? '/dashboard' : '/onboard';
  const response = NextResponse.redirect(`${BASE_URL}${redirectPath}`);
  
  // Create a session with only userId and accessToken
  const sessionData: UserSession = {
    userId: userInfo.id,
    accessToken: longLivedToken
  };
  
  // Set the session cookie on the response
  return setSession(response, sessionData);
} 