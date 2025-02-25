import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TwitterApi } from 'twitter-api-v2';
import prisma from '@/lib/prisma';
import { decrypt } from '@/utils/encryption';

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { content } = await req.json();

    if (!content || typeof content !== 'string' || content.length > 280) {
      return NextResponse.json({ error: 'Contenu du tweet invalide' }, { status: 400 });
    }

    // Get user from database
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

    // Decrypt the access token
    const accessToken = decrypt(twitterAccount.accessToken);

    // Initialize Twitter client with the decrypted token
    const client = new TwitterApi(accessToken);

    // Post the tweet
    const tweet = await client.v2.tweet({ text: content });

    // Save the tweet in the database
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