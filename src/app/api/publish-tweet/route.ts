import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { TwitterApi } from 'twitter-api-v2';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, mediaIds } = await req.json();

    // Validate tweet content
    if (!content || content.length > 280) {
      return NextResponse.json(
        { error: 'Invalid tweet content' },
        { status: 400 }
      );
    }

    // Get user's Twitter token
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { accounts: true },
    });

    const twitterAccount = user?.accounts.find(
      (account) => account.provider === 'twitter'
    );

    if (!twitterAccount) {
      return NextResponse.json(
        { error: 'Twitter account not connected' },
        { status: 400 }
      );
    }

    // Initialize Twitter client
    const client = new TwitterApi({
      accessToken: twitterAccount.access_token,
      accessSecret: twitterAccount.access_token_secret,
    });

    // Publish tweet
    const tweet = await client.v2.tweet({
      text: content,
      media: mediaIds ? { media_ids: mediaIds } : undefined,
    });

    // Save tweet to database
    const savedTweet = await prisma.tweet.create({
      data: {
        content,
        tweetId: tweet.data.id,
        userId: user.id,
        status: 'PUBLISHED',
      },
    });

    return NextResponse.json(savedTweet);
  } catch (error) {
    console.error('Error publishing tweet:', error);
    return NextResponse.json(
      { error: 'Failed to publish tweet' },
      { status: 500 }
    );
  }
}
