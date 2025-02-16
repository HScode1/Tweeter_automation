import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import prisma from '@/lib/prisma';
import { Account, Prisma } from '@prisma/client';

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
        status: 'PENDING',
      },
      include: {
        user: {
          include: {
            accounts: true,
          },
        },
        media: true, // Include media relation
      },
    });

    const results = await Promise.all(
      scheduledTweets.map(async (tweet: Prisma.ScheduledTweetGetPayload<{ include: { user: { include: { accounts: true } }, media: true } }>) => {
        try {
          const twitterAccount = tweet.user.accounts.find(
            (account: Account) => account.platform === 'twitter'
          );

          if (!twitterAccount) {
            throw new Error('Twitter account not connected');
          }

          // Initialize Twitter client
          const client = new TwitterApi({
            appKey: process.env.TWITTER_CLIENT_ID!,
            appSecret: process.env.TWITTER_CLIENT_SECRET!,
            accessToken: twitterAccount.token,
            accessSecret: twitterAccount.token,
          });

          // Get media IDs from the media relation
          const mediaIds = tweet.media?.map(m => m.url) || [];

          // Préparer les paramètres du tweet
          const tweetParams: any = {
            text: tweet.content
          };

          // Ajouter les médias si présents
          if (mediaIds.length > 0) {
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

          // Publish tweet
          const publishedTweet = await client.v2.tweet(tweetParams);

          // Update tweet status
          const updateData = {
            status: 'PUBLISHED' as const,
            ...(publishedTweet.data.id ? { tweetId: publishedTweet.data.id } : {})
          };
          
          await prisma.scheduledTweet.update({
            where: { id: tweet.id },
            data: updateData,
          });

          return {
            id: tweet.id,
            status: 'success',
            tweetId: publishedTweet.data.id,
          };
        } catch (error) {
          console.error(`Error publishing tweet ${tweet.id}:`, error);
          
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          
          // Update tweet status to failed
          const updateData = {
            status: 'FAILED' as const,
            ...(errorMessage ? { errorMessage } : {})
          };
          
          await prisma.scheduledTweet.update({
            where: { id: tweet.id },
            data: updateData,
          });

          return {
            id: tweet.id,
            status: 'error',
            error: errorMessage,
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
