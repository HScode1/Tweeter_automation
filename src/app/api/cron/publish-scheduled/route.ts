import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import { prisma } from '@/lib/prisma';

// This endpoint should be called by a cron job service (e.g., Vercel Cron)
export async function GET() {
  try {
    // Get all tweets that are scheduled to be published
    const now = new Date();
    const scheduledTweets = await prisma.scheduledTweet.findMany({
      where: {
        scheduledFor: {
          lte: now,
        },
        status: 'SCHEDULED',
      },
      include: {
        user: {
          include: {
            accounts: true,
          },
        },
      },
    });

    const results = await Promise.all(
      scheduledTweets.map(async (tweet) => {
        try {
          const twitterAccount = tweet.user.accounts.find(
            (account) => account.provider === 'twitter'
          );

          if (!twitterAccount) {
            throw new Error('Twitter account not connected');
          }

          // Initialize Twitter client
          const client = new TwitterApi({
            accessToken: twitterAccount.access_token,
            accessSecret: twitterAccount.access_token_secret,
          });

          // Publish tweet
          const publishedTweet = await client.v2.tweet({
            text: tweet.content,
            media: tweet.mediaIds
              ? { media_ids: tweet.mediaIds }
              : undefined,
          });

          // Update tweet status
          await prisma.scheduledTweet.update({
            where: { id: tweet.id },
            data: {
              status: 'PUBLISHED',
              publishedTweetId: publishedTweet.data.id,
            },
          });

          return {
            id: tweet.id,
            status: 'success',
            tweetId: publishedTweet.data.id,
          };
        } catch (error) {
          console.error(`Error publishing tweet ${tweet.id}:`, error);
          
          // Update tweet status to failed
          await prisma.scheduledTweet.update({
            where: { id: tweet.id },
            data: {
              status: 'FAILED',
              error: error.message,
            },
          });

          return {
            id: tweet.id,
            status: 'error',
            error: error.message,
          };
        }
      })
    );

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error) {
    console.error('Error processing scheduled tweets:', error);
    return NextResponse.json(
      { error: 'Failed to process scheduled tweets' },
      { status: 500 }
    );
  }
}
