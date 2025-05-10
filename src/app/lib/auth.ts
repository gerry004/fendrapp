const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || '';
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || '';
const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.BASE_URL_PRODUCTION : process.env.BASE_URL_DEVELOPMENT;
const FACEBOOK_REDIRECT_URI = BASE_URL + '/api/facebook/callback';
const FACEBOOK_TOKEN_URL = 'https://graph.facebook.com/v19.0/oauth/access_token';

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

export { getShortLivedToken, getLongLivedToken, getUserNameAndId };