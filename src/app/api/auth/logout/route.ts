import { NextRequest, NextResponse } from 'next/server';
import { clearSession } from '@/app/lib/session';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  return clearSession(response);
} 