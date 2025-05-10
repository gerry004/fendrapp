import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/prismaClient';

const FACEBOOK_CLIENT_ID = '1377511903432243';
const FACEBOOK_CLIENT_SECRET = '5a09e1554db473d8ab56ae5594f82697';
const FACEBOOK_REDIRECT_URI = 'http://localhost:3000/api/facebook/callback';
const FACEBOOK_TOKEN_URL = 'https://graph.facebook.com/v19.0/oauth/access_token';
const BASE_URL = 'http://localhost:3000';

async function getShortLivedToken(code: string): Promise<string | null> {
  const params = new URLSearchParams({
    client_id: FACEBOOK_CLIENT_ID,
    redirect_uri: FACEBOOK_REDIRECT_URI,
    client_secret: FACEBOOK_CLIENT_SECRET,
    code,
  });
  const tokenRes = await fetch(`${FACEBOOK_TOKEN_URL}?${params.toString()}`);
  const tokenData = await tokenRes.json();
  return tokenData.access_token || null;
}

async function getLongLivedToken(shortLivedToken: string): Promise<string | null> {
  const longLivedParams = new URLSearchParams({
    grant_type: 'fb_exchange_token',
    client_id: FACEBOOK_CLIENT_ID,
    client_secret: FACEBOOK_CLIENT_SECRET,
    fb_exchange_token: shortLivedToken,
  });
  const longLivedRes = await fetch(`${FACEBOOK_TOKEN_URL}?${longLivedParams.toString()}`);
  const longLivedData = await longLivedRes.json();
  return longLivedData.access_token || null;
}

async function getUserNameAndId(longLivedToken: string): Promise<{ name: string; id: string } | null> {
  const userRes = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${longLivedToken}`);
  const userData = await userRes.json();
  if (!userData.id || !userData.name) return null;
  return { name: userData.name, id: userData.id };
}

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

  // Redirect to dashboard after successful token exchange (absolute URL required)
  return NextResponse.redirect(`${BASE_URL}/dashboard`);
} 