import { NextRequest, NextResponse } from 'next/server';

const FACEBOOK_CLIENT_ID = '1377511903432243';
const FACEBOOK_REDIRECT_URI = 'http://localhost:3000/api/facebook/callback';
const FACEBOOK_OAUTH_URL = 'https://www.facebook.com/dialog/oauth';
const SCOPE = 'instagram_basic,business_management,pages_show_list,instagram_manage_comments,pages_read_engagement';

// Helper to construct the Facebook OAuth URL
function getFacebookOAuthUrl({
  clientId,
  redirectUri,
  display = 'page',
  extras = '',
  responseType = 'code',
  scope = SCOPE,
}: {
  clientId: string;
  redirectUri: string;
  display?: string;
  extras?: string;
  responseType?: string;
  scope?: string;
}) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    display,
    response_type: responseType,
    scope,
  });
  if (extras) params.append('extras', extras);
  return `${FACEBOOK_OAUTH_URL}?${params.toString()}`;
}

export async function GET() {
  const oauthUrl = getFacebookOAuthUrl({
    clientId: FACEBOOK_CLIENT_ID,
    redirectUri: FACEBOOK_REDIRECT_URI,
  });
  return NextResponse.json({ oauthUrl });
} 