import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TwitterApi } from 'twitter-api-v2';
import prisma from '@/lib/prisma';
import type { SendTweetV2Params } from 'twitter-api-v2';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { content, mediaIds } = await req.json();

    if (!content || typeof content !== 'string' || content.length > 280) {
      return NextResponse.json({ error: 'Contenu du tweet invalide' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const twitterAccount = user.accounts.find((account) => account.platform === 'twitter');

    if (!twitterAccount) {
      return NextResponse.json({ error: 'Compte Twitter non connecté' }, { status: 400 });
    }

    // Initialisation du client Twitter avec le token
    const client = new TwitterApi(twitterAccount.token);

    // Préparer les paramètres du tweet
    const tweetParams: SendTweetV2Params = { text: content };

    // Ajouter les médias si présents
    if (mediaIds && Array.isArray(mediaIds) && mediaIds.length > 0) {
      const validMediaIds = mediaIds.slice(0, 4);
      tweetParams.media = { 
        media_ids: validMediaIds as [string] | [string, string] | [string, string, string] | [string, string, string, string] 
      };
    }

    // Publier le tweet
    const tweet = await client.v2.tweet(tweetParams);

    // Enregistrer le tweet dans la base de données
    const savedTweet = await prisma.scheduledTweet.create({
      data: {
        content,
        status: 'PUBLISHED',
        scheduledFor: new Date(),
        userId: user.id,
        tweetId: tweet.data.id,
      },
    });

    return NextResponse.json(savedTweet);
  } catch (error) {
    console.error('Erreur lors de la publication du tweet:', error);
    return NextResponse.json(
      { error: 'Échec de la publication du tweet' },
      { status: 500 }
    );
  }
}