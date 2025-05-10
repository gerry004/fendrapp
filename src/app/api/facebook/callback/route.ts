import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/prismaClient';
import { setSession, UserSession } from '@/app/lib/session';
import { getShortLivedToken, getLongLivedToken, getUserNameAndId } from '@/app/lib/auth';

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

  // Upsert user in the database (now split into find, update, or create)
  const existingUser = await prisma.user.findUnique({ where: { id: userInfo.id } });
  if (existingUser) {
    await prisma.user.update({
      where: { id: userInfo.id },
      data: { access_token: longLivedToken },
    });
  } else {
    await prisma.user.create({
      data: { id: userInfo.id, username: userInfo.name, access_token: longLivedToken },
    });
  }

  // Create a redirect response
  const response = NextResponse.redirect(`${BASE_URL}/dashboard`);
  
  // Create a session and set the cookie
  const sessionData: UserSession = {
    userId: userInfo.id,
    name: userInfo.name,
    accessToken: longLivedToken
  };
  
  // Set the session cookie on the response
  return setSession(response, sessionData);
} 