// route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/auth.config';
import prisma from '@/lib/prisma';
import { TwitterApi } from 'twitter-api-v2';
import { Prisma } from '@prisma/client';
import type { SendTweetV2Params } from 'twitter-api-v2';

interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = session.user as SessionUser;

    const { content, mediaIds } = await req.json();

    if (!content || content.length > 280) {
      return NextResponse.json(
        { error: 'Contenu du tweet invalide' },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { accounts: true }
    }) as Prisma.UserGetPayload<{ include: { accounts: true } }>;

    const twitterAccount = dbUser.accounts.find(
      (account: { platform: string; token: string }) => account.platform === 'twitter'
    );

    if (!twitterAccount) {
      return NextResponse.json(
        { error: 'Compte Twitter non connecté' },
        { status: 400 }
      );
    }

    // Initialisation du client Twitter avec le token
    const client = new TwitterApi(twitterAccount.token);

    // Préparer les paramètres du tweet
    const tweetParams: SendTweetV2Params = {
      text: content
    };

    // Ajouter les médias si présents
    if (mediaIds && mediaIds.length > 0) {
      // Limiter à 4 médias et s'assurer que c'est un tuple valide
      const validMediaIds = mediaIds.slice(0, 4);
      if (validMediaIds.length === 1) {
        tweetParams.media = { media_ids: [validMediaIds[0]] };
      } else if (validMediaIds.length === 2) {
        tweetParams.media = { media_ids: [validMediaIds[0], validMediaIds[1]] };
      } else if (validMediaIds.length === 3) {
        tweetParams.media = { media_ids: [validMediaIds[0], validMediaIds[1], validMediaIds[2]] };
      } else if (validMediaIds.length === 4) {
        tweetParams.media = { media_ids: [validMediaIds[0], validMediaIds[1], validMediaIds[2], validMediaIds[3]] };
      }
    }

    const tweet = await client.v2.tweet(tweetParams);

    const savedTweet = await prisma.scheduledTweet.create({
      data: {
        content,
        status: 'PUBLISHED' as const,
        scheduledFor: new Date(),
        userId: user.id,
        ...(tweet.data.id ? { tweetId: tweet.data.id } : {})
      }
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
