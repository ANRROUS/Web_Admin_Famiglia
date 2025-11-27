import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST() {
  // Option 1: Use cookies() API
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');

  // Option 2: Return response with cookie expiration (Double safety)
  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_token', '', { 
    maxAge: 0, 
    path: '/',
    expires: new Date(0)
  });
  
  return response;
}
