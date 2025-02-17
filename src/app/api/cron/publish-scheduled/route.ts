import { NextResponse } from 'next/server';
import { TwitterApi, TweetV2PostTweetResult } from 'twitter-api-v2';
import type { SendTweetV2Params } from 'twitter-api-v2';
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

          // Get media URLs from the media relation
          const mediaUrls = tweet.media?.map(m => m.url) || [];

          // Prepare tweet parameters
          const tweetParams: SendTweetV2Params = {
            text: tweet.content
          };

          // Upload and attach media if present
          if (mediaUrls.length > 0) {
            try {
              // Limit to 4 media items
              const validMediaUrls = mediaUrls.slice(0, 4);
              
              // Upload each media and get media IDs
              const uploadedMediaIds = await Promise.all(
                validMediaUrls.map(async (url) => {
                  const mediaId = await client.v1.uploadMedia(url);
                  return mediaId;
                })
              );

              // Convert array to proper tuple based on length
              switch (uploadedMediaIds.length) {
                case 1:
                  tweetParams.media = { media_ids: [uploadedMediaIds[0]] as [string] };
                  break;
                case 2:
                  tweetParams.media = { media_ids: [uploadedMediaIds[0], uploadedMediaIds[1]] as [string, string] };
                  break;
                case 3:
                  tweetParams.media = { 
                    media_ids: [uploadedMediaIds[0], uploadedMediaIds[1], uploadedMediaIds[2]] as [string, string, string] 
                  };
                  break;
                case 4:
                  tweetParams.media = { 
                    media_ids: [uploadedMediaIds[0], uploadedMediaIds[1], uploadedMediaIds[2], uploadedMediaIds[3]] as [string, string, string, string] 
                  };
                  break;
              }
            } catch (error) {
              console.error('Error uploading media:', error);
              // Continue with text-only tweet if media upload fails
            }
          }

          // Publish tweet using v2 endpoint
          const publishedTweet: TweetV2PostTweetResult = await client.v2.tweet(tweetParams);

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
