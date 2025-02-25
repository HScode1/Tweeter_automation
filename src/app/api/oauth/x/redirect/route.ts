import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function generateCodeVerifier() {
  return crypto.randomBytes(32)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .substr(0, 128);
}

function generateCodeChallenge(verifier: string) {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export async function GET(req: NextRequest) {
  try {
    // Generate random state
    const state = crypto.randomBytes(32).toString('hex');
    
    // Generate code verifier and challenge for PKCE
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    
    // Build redirect URL
    const params = new URLSearchParams({
      client_id: process.env.TWITTER_CLIENT_ID!,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/x/callback`,
      response_type: 'code',
      scope: 'tweet.read tweet.write users.read offline.access',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    // Build Twitter authorization URL
    const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
    authUrl.search = params.toString();

    // Create response with redirect
    const response = NextResponse.redirect(authUrl.toString());
    
    // Store state and code verifier in secure cookies
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });

    response.cookies.set('code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('Error in redirect:', error);
    return NextResponse.redirect(new URL('/accounts?error=redirect_failed', req.url));
  }
}
