import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  
  console.log('Instagram OAuth Code:', code);
  
  // You can add additional logic here to exchange the code for an access token
  
  // Redirect back to home page or a success page
  return NextResponse.redirect(new URL('/', request.url));
} 