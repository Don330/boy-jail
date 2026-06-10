import { fetchAuthSession } from 'aws-amplify/auth/server';
import { createServerRunner } from '@aws-amplify/adapter-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import outputs from '../amplify_outputs.json';

const { runWithAmplifyServerContext: runServer } = createServerRunner({
  config: outputs,
});

const PUBLIC_PATHS = ['/auth', '/join'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  let authenticated = false;
  try {
    await runServer({
      nextServerContext: { request, response: NextResponse.next() },
      operation: async (contextSpec) => {
        const session = await fetchAuthSession(contextSpec);
        authenticated = !!session.tokens;
      },
    });
  } catch {
    authenticated = false;
  }

  if (!authenticated && !isPublic) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  if (authenticated && pathname === '/auth') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
};
