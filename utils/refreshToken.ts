import { decrypt, encrypt } from './encryption';
import { prisma } from '@/lib/prisma';

export async function refreshTwitterToken(userId: string) {
  try {
    const userToken = await prisma.userToken.findUnique({
      where: { userId },
    });

    if (!userToken) {
      throw new Error('No token found for user');
    }

    const refreshToken = decrypt(userToken.refreshToken);

    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const tokenData = await response.json();

    // Mettre à jour les tokens
    await prisma.userToken.update({
      where: { userId },
      data: {
        accessToken: encrypt(tokenData.access_token),
        refreshToken: encrypt(tokenData.refresh_token),
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      },
    });

    return tokenData.access_token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}