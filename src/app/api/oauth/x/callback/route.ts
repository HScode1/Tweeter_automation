import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { encrypt } from '@/utils/encryption';

export async function GET(req) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const storedState = req.cookies.get('oauth_state')?.value;
  const codeVerifier = req.cookies.get('code_verifier')?.value;

  // Validate OAuth parameters
  if (!code || !state) {
    console.error('Missing code or state');
    return NextResponse.redirect(new URL('/accounts?error=missing_params', req.url));
  }

  try {
    // Get authenticated user ID from Clerk
    const { userId } = await auth(req);
    if (!userId) {
      console.error('User not authenticated');
      return NextResponse.redirect(new URL('/accounts?error=unauthorized', req.url));
    }

    // Validate state parameter to prevent CSRF attacks
    if (!state || !storedState || state !== storedState) {
      console.error('Invalid state parameter');
      return NextResponse.redirect(new URL('/accounts?error=invalid_state', req.url));
    }

    // Ensure code verifier is present for PKCE
    if (!codeVerifier) {
      console.error('Missing code verifier');
      return NextResponse.redirect(new URL('/accounts?error=missing_verifier', req.url));
    }

    // Fetch the full user object from Clerk to get the email
    const clerkUser = await currentUser();
    if (!clerkUser) {
      console.error('Clerk user not found');
      return NextResponse.redirect(new URL('/accounts?error=user_not_found', req.url));
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      console.error('User email not found');
      return NextResponse.redirect(new URL('/accounts?error=email_not_found', req.url));
    }

    // Get user's name from Clerk
    const name = clerkUser.firstName && clerkUser.lastName 
      ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
      : clerkUser.firstName || clerkUser.lastName || email.split('@')[0];

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/x/callback`,
        code_verifier: codeVerifier,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange error:', errorData);
      return NextResponse.redirect(new URL('/accounts?error=token_exchange', req.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;

    // Fetch Twitter user info
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      console.error('Failed to fetch user info');
      return NextResponse.redirect(new URL('/accounts?error=user_info', req.url));
    }

    const userData = await userResponse.json();
    const twitterUserId = userData.data.id;
    const twitterUsername = userData.data.username;

    // Encrypt tokens for storage
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = encrypt(refreshToken);

    // Upsert the user with email
    const dbUser = await prisma.user.upsert({
      where: { clerkId: userId },
      create: {
        clerkId: userId,
        email: email,
        name: name,  // Add the user's name
      },
      update: {},  // No updates needed for existing user
    });

    // Upsert the Twitter account using the correct database userId
    await prisma.account.upsert({
      where: {
        userId_platform: {
          userId: dbUser.id,  // Use the database user ID (UUID)
          platform: 'twitter',
        },
      },
      create: {
        userId: dbUser.id,
        platform: 'twitter',
        username: twitterUsername,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
      },
      update: {
        username: twitterUsername,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
      },
    });

    // Clear OAuth state and code verifier cookies
    const response = NextResponse.redirect(new URL('/accounts', req.url));
    response.cookies.delete('oauth_state');
    response.cookies.delete('code_verifier');
    return response;
  } catch (error) {
    // Enhanced error logging
    console.log('Error type:', typeof error);
    console.log('Error is Error instance:', error instanceof Error);
    if (error instanceof Error) {
      console.log('Error name:', error.name);
      console.log('Error message:', error.message);
      console.log('Error stack:', error.stack);
    } else {
      console.log('Non-Error exception caught:', error);
    }
    return NextResponse.redirect(new URL('/accounts?error=auth_failed', req.url));
  }
}