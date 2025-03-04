import { decrypt, encrypt } from './encryption';
import prisma from '@/lib/prisma';
import { TwitterApi } from 'twitter-api-v2';

// Fonction pour rafraîchir le token Twitter à partir des tokens déchiffrés
export async function refreshTwitterToken(accessToken: string, refreshToken: string) {
  try {
    if (!refreshToken) {
      console.log('No refresh token available, returning existing access token');
      return { accessToken, refreshToken };
    }

    console.log('Attempting to refresh Twitter token');
    
    // Create a client with client ID and secret for token refresh
    const client = new TwitterApi({ 
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET! 
    });
    
    // Use the Twitter API's built-in refresh method
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await client.refreshOAuth2Token(refreshToken);
    
    console.log('Successfully refreshed token');
    
    return { 
      accessToken: newAccessToken, 
      refreshToken: newRefreshToken 
    };
  } catch (error) {
    console.error('Error refreshing token:', error instanceof Error ? error.message : 'Unknown error');
    // En cas d'erreur, retourner les tokens existants
    return { accessToken, refreshToken };
  }
}

// Fonction pour rafraîchir le token Twitter d'un utilisateur à partir de la base de données
export async function refreshTwitterTokenForUser(userId: string) {
  try {
    // Trouver le compte Twitter de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { accounts: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const twitterAccount = user.accounts.find((account) => account.platform === 'twitter');

    if (!twitterAccount) {
      throw new Error('No Twitter account found for user');
    }

    // Déchiffrer les tokens
    const decryptedAccessToken = decrypt(twitterAccount.accessToken);
    const decryptedRefreshToken = twitterAccount.refreshToken ? decrypt(twitterAccount.refreshToken) : '';

    if (!decryptedRefreshToken) {
      throw new Error('No refresh token available');
    }

    // Rafraîchir les tokens
    const { accessToken, refreshToken } = await refreshTwitterToken(
      decryptedAccessToken,
      decryptedRefreshToken
    );

    // Mettre à jour les tokens dans la base de données
    await prisma.account.update({
      where: { 
        id: twitterAccount.id 
      },
      data: {
        accessToken: encrypt(accessToken),
        refreshToken: encrypt(refreshToken),
        tokenExpiresAt: new Date(Date.now() + 7200 * 1000), // 2 heures par défaut
      },
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error('Error refreshing token for user:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}