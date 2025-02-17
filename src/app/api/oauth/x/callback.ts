import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { encrypt } from '@/utils/encryption';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

interface CustomSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: Role;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code, state } = req.query;
  const storedState = req.cookies.oauth_state;

  try {
    // Get the user session
    const session = await getSession({ req }) as CustomSession;
    
    if (!session?.user?.id) {
      throw new Error('User not authenticated');
    }

    // Verify the state
    if (!state || !storedState || state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/x/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    // Encrypt and store tokens
    const encryptedAccessToken = encrypt(tokenData.access_token);
    const encryptedRefreshToken = encrypt(tokenData.refresh_token);

    // Store in database
    await prisma.userToken.upsert({
      where: { userId: session.user.id },  // Using the session user ID
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      },
      create: {
        userId: session.user.id,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      },
    });

    // Redirect to success page
    res.redirect('/dashboard?auth=success');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/dashboard?auth=error');
  }
}