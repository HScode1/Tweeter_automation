import { NextApiRequest, NextApiResponse } from 'next';
import { encrypt } from '@/utils/encryption';
import { prisma } from '@/lib/prisma'; // Assumant que vous utilisez Prisma

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { code, state } = req.query;
  const storedState = req.cookies.oauth_state;

  try {
    // Vérifier le state
    if (!state || !storedState || state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    // Échanger le code contre un token
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

    // Chiffrer et stocker les tokens
    const encryptedAccessToken = encrypt(tokenData.access_token);
    const encryptedRefreshToken = encrypt(tokenData.refresh_token);

    // Stocker dans la base de données (exemple avec Prisma)
    await prisma.userToken.upsert({
      where: { userId: req.session.userId }, // Assumant que vous avez un système d'authentification
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      },
      create: {
        userId: req.session.userId,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      },
    });

    // Rediriger vers la page de succès
    res.redirect('/dashboard?auth=success');
  } catch (error) {
    console.error('Erreur callback OAuth:', error);
    res.redirect('/dashboard?auth=error');
  }
}