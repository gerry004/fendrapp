import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/app/lib/session';

export async function GET(request: NextRequest) {
  const session = getSession(request);
  
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  
  return NextResponse.json({ user: session });
} 