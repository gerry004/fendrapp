const FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID || '';
const FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET || '';
const BASE_URL = process.env.NODE_ENV === 'production' ? process.env.BASE_URL_PRODUCTION : process.env.BASE_URL_DEVELOPMENT;
const FACEBOOK_REDIRECT_URI = BASE_URL + '/api/facebook/callback';
const FACEBOOK_TOKEN_URL = 'https://graph.facebook.com/v19.0/oauth/access_token';

async function getShortLivedToken(code: string): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      client_id: FACEBOOK_CLIENT_ID,
      redirect_uri: FACEBOOK_REDIRECT_URI,
      client_secret: FACEBOOK_CLIENT_SECRET,
      code,
    });

    const tokenRes = await fetch(`${FACEBOOK_TOKEN_URL}?${params.toString()}`);
    
    if (!tokenRes.ok) {
      const errorData = await tokenRes.json();
      console.error('Facebook token error:', errorData);
      return null;
    }
    
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      console.error('No access token in Facebook response:', tokenData);
    }
    return tokenData.access_token || null;
  } catch (error) {
    console.error('Error retrieving short-lived token:', error);
    return null;
  }
}

async function getLongLivedToken(shortLivedToken: string): Promise<string | null> {
  try {
    const longLivedParams = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: FACEBOOK_CLIENT_ID,
      client_secret: FACEBOOK_CLIENT_SECRET,
      fb_exchange_token: shortLivedToken,
    });
    const longLivedRes = await fetch(`${FACEBOOK_TOKEN_URL}?${longLivedParams.toString()}`);

    if (!longLivedRes.ok) {
      const errorData = await longLivedRes.json();
      console.error('Facebook long-lived token error:', errorData);
      return null;
    }

    const longLivedData = await longLivedRes.json();
    if (!longLivedData.access_token) {
      console.error('No access token in Facebook response:', longLivedData);
    }
    return longLivedData.access_token || null; 
  } catch (error) {
    console.error('Error retrieving long-lived token:', error);
    return null;
  }
}

async function getUserNameAndId(longLivedToken: string): Promise<{ name: string; id: string } | null> {
  try {
    const userRes = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${longLivedToken}`);

    if (!userRes.ok) {
      const errorData = await userRes.json();
      console.error('Facebook user info error:', errorData);
      return null;
    }

    const userData = await userRes.json();
    if (!userData.id || !userData.name) return null;
    return { name: userData.name, id: userData.id };
  } catch (error) {
    console.error('Error retrieving user info:', error);
    return null;
  }
}

export { getShortLivedToken, getLongLivedToken, getUserNameAndId };