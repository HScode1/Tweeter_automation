import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@clerk/nextjs/server';
import { encrypt } from '@/utils/encryption';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code, state } = req.query;
  const storedState = req.cookies.oauth_state;

  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    if (!state || !storedState || state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString('base64')}`,
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
    const accessToken = tokenData.access_token;

    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData = await userResponse.json();
    const twitterUsername = userData.data.username;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (!user) {
      throw new Error('User not found in database');
    }

    const encryptedAccessToken = encrypt(tokenData.access_token);
    const encryptedRefreshToken = encrypt(tokenData.refresh_token);

    await prisma.account.upsert({
      where: {
        userId_platform: { userId: user.id, platform: 'twitter' },
      },
      update: {
        username: twitterUsername,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      },
      create: {
        userId: user.id,
        platform: 'twitter',
        username: twitterUsername,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      },
    });

    res.redirect('/dashboard?auth=success');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/dashboard?auth=error');
  }
}