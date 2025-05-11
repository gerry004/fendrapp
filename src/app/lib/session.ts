import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'facebook_session';

export interface UserSession {
  userId: string;
  accessToken: string;
}

export function setSession(response: NextResponse, sessionData: UserSession): NextResponse {
  // Encrypt and serialize session data (in a real app, you'd want to encrypt this data)
  const serialized = JSON.stringify(sessionData);
  
  // Set the cookie with HttpOnly and Secure flags
  response.cookies.set({
    name: SESSION_COOKIE,
    value: serialized,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
  
  return response;
}

export function getSession(request: NextRequest): UserSession | null {
  const cookie = request.cookies.get(SESSION_COOKIE);
  if (!cookie?.value) return null;
  
  try {
    return JSON.parse(cookie.value) as UserSession;
  } catch (e) {
    return null;
  }
}

export function clearSession(response: NextResponse): NextResponse {
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export async function getServerSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  
  if (!sessionCookie?.value) return null;
  
  try {
    return JSON.parse(sessionCookie.value) as UserSession;
  } catch (e) {
    return null;
  }
} 