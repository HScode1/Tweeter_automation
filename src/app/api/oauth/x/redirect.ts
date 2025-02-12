import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Générer un state aléatoire
    const state = crypto.randomBytes(32).toString('hex');
    
    // Stocker le state en session ou dans un store temporaire
    // Ici exemple avec cookies sécurisés
    res.setHeader('Set-Cookie', `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/`);

    // Construire l'URL de redirection
    const params = new URLSearchParams({
      client_id: process.env.TWITTER_CLIENT_ID!,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/oauth/x/callback`,
      response_type: 'code',
      scope: 'tweet.read tweet.write users.read offline.access',
      state: state,
    });

    const authUrl = `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
    res.redirect(authUrl);
  } catch (error) {
    console.error('Erreur de redirection OAuth:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}