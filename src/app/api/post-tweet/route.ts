import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { TwitterApi } from 'twitter-api-v2';
import prisma from '@/lib/prisma';
import { decrypt } from '@/utils/encryption';
import { refreshTwitterToken } from '@/utils/refreshToken';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Helper function to fetch image data from URL
async function fetchImageFromUrl(url: string): Promise<Buffer> {
  console.log(`Fetching image from URL: ${url}`);
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Function to handle YouTube thumbnails, trying multiple variations if needed
async function processYouTubeThumbnail(url: string): Promise<{ buffer: Buffer; mimeType: string }> {
  // Check if this is a YouTube URL
  if (url.includes('youtube.com/vi/') || url.includes('youtu.be')) {
    console.log('Processing YouTube thumbnail');
    
    // Extract video ID
    let videoId = '';
    if (url.includes('youtube.com/vi/')) {
      videoId = url.split('/vi/')[1].split('/')[0];
    } else if (url.includes('youtu.be')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    
    if (!videoId) {
      throw new Error('Could not extract YouTube video ID');
    }
    
    console.log(`Extracted YouTube video ID: ${videoId}`);
    
    // Try different thumbnail URLs in order of preference
    const thumbnailOptions = [
      `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, // HD thumbnail
      `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,     // High quality thumbnail
      `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,     // Medium quality thumbnail
      `https://img.youtube.com/vi/${videoId}/default.jpg`,       // Default thumbnail
    ];
    
    let lastError = null;
    
    // Try each thumbnail option
    for (const thumbnailUrl of thumbnailOptions) {
      try {
        console.log(`Trying YouTube thumbnail: ${thumbnailUrl}`);
        const buffer = await fetchImageFromUrl(thumbnailUrl);
        console.log(`Successfully fetched YouTube thumbnail: ${thumbnailUrl}`);
        return { buffer, mimeType: 'image/jpeg' };
      } catch (error) {
        console.log(`Failed to fetch YouTube thumbnail ${thumbnailUrl}: ${error.message}`);
        lastError = error;
      }
    }
    
    // If we get here, all attempts failed
    throw lastError || new Error('Failed to fetch any YouTube thumbnail');
  }
  
  // Not a YouTube URL, fetch normally
  const buffer = await fetchImageFromUrl(url);
  
  // Determine MIME type based on URL extension
  let mimeType = 'image/jpeg'; // default
  if (url.toLowerCase().endsWith('.png')) {
    mimeType = 'image/png';
  } else if (url.toLowerCase().endsWith('.gif')) {
    mimeType = 'image/gif';
  } else if (url.toLowerCase().endsWith('.mp4')) {
    mimeType = 'video/mp4';
  }
  
  return { buffer, mimeType };
}

async function uploadMediaToTwitterV2(client: TwitterApi, url: string, index: number, total: number): Promise<string> {
  console.log(`Uploading media ${index + 1}/${total}: ${url.substring(0, 30)}...`);
  try {
    // Process the image, handling YouTube thumbnails specially
    const { buffer: mediaBuffer, mimeType } = await processYouTubeThumbnail(url);
    console.log(`Successfully fetched media ${index + 1}, size: ${mediaBuffer.length} bytes`);
    console.log(`Uploading with MIME type: ${mimeType}`);
    
    // Create a temporary file
    const tempDir = os.tmpdir();
    const extension = mimeType.split('/')[1];
    const tempFilePath = path.join(tempDir, `twitter_media_${index}_${Date.now()}.${extension}`);
    
    // Write media to temporary file
    console.log(`Writing media to temporary file: ${tempFilePath}`);
    fs.writeFileSync(tempFilePath, mediaBuffer);
    
    try {
      // Get the v1 client for media uploads
      const v1Client = client.readWrite;
      
      // Use the uploadMedia method which handles the chunked upload process
      const mediaId = await v1Client.v1.uploadMedia(tempFilePath, {
        mimeType: mimeType
      });
      
      console.log(`Successfully uploaded media with ID: ${mediaId}`);
      return mediaId;
    } finally {
      // Clean up the temporary file
      if (fs.existsSync(tempFilePath)) {
        console.log(`Cleaning up temporary file: ${tempFilePath}`);
        fs.unlinkSync(tempFilePath);
      }
    }
  } catch (error: any) {
    // Journalisation très détaillée de l'objet d'erreur
    console.error(`========= ERROR DETAILS FOR MEDIA ${index + 1} =========`);
    console.error(`Error message: ${error.message}`);
    console.error(`Error code: ${error.code}`);
    console.error(`Error type: ${error.type}`);
    
    // Afficher les headers complets s'ils existent
    if (error.headers) {
      console.error('Error headers:');
      console.error(JSON.stringify(error.headers, null, 2));
      
      // Vérifier spécifiquement les headers d'erreur Twitter
      if (error.headers['x-response-body']) {
        try {
          const responseBody = JSON.parse(error.headers['x-response-body']);
          console.error('Twitter API response body:');
          console.error(JSON.stringify(responseBody, null, 2));
        } catch (e) {
          console.error('Raw x-response-body:', error.headers['x-response-body']);
        }
      }
      
      // Vérifier d'autres headers importants
      if (error.headers['x-twitter-response-tags']) {
        console.error('Twitter response tags:', error.headers['x-twitter-response-tags']);
      }
    }

    // Afficher toutes les propriétés de l'objet d'erreur
    console.error('All error properties:');
    for (const prop in error) {
      if (prop !== 'headers') { // On a déjà affiché les headers ci-dessus
        try {
          console.error(`${prop}:`, JSON.stringify(error[prop], null, 2));
        } catch (e) {
          console.error(`${prop} (non-stringifiable):`, error[prop]);
        }
      }
    }
    
    // Afficher l'erreur complète sous forme de chaîne
    console.error('Full error object:');
    console.error(error);
    console.error('================================================');
    
    throw new Error(`Error uploading media ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'} (Code: ${'code' in error ? error.code : 'Unknown'})`);
  }
}


export async function POST(req) {
  try {
    console.log('Starting post-tweet API request');
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { content, mediaUrls = [] } = await req.json();
    console.log('Request payload:', { content: content.substring(0, 20) + '...', mediaUrlsCount: mediaUrls.length });

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

    console.log('Found Twitter account for user');

    // Check if we have the token
    if (!twitterAccount.accessToken) {
      return NextResponse.json({ error: 'Token Twitter manquant' }, { status: 400 });
    }

    // Decrypt tokens
    const decryptedAccessToken = decrypt(twitterAccount.accessToken);
    const decryptedRefreshToken = twitterAccount.refreshToken ? decrypt(twitterAccount.refreshToken) : '';

    console.log('Refreshing Twitter tokens if needed');
    // Refresh token if necessary
    const { accessToken, refreshToken } = await refreshTwitterToken(decryptedAccessToken, decryptedRefreshToken);

    // Initialize Twitter client with the correct tokens
    console.log('Initializing Twitter client with tokens');
    const client = new TwitterApi(accessToken);

    console.log('Initialized Twitter client');

    // Prepare tweet parameters
    let tweet;

    // Handle media uploads if present
    if (mediaUrls && mediaUrls.length > 0) {
      try {
        console.log('Processing media uploads');
        // Limit to 4 media items (Twitter's limit)
        const validMediaUrls = mediaUrls.slice(0, 4);
        
        // Upload each media and get media IDs
        const uploadedMediaIds = await Promise.all(
          validMediaUrls.map((url, index) => uploadMediaToTwitterV2(client, url, index, validMediaUrls.length))
        );

        console.log(`Successfully uploaded ${uploadedMediaIds.length} media items`);

        // Post tweet with media
        tweet = await client.v2.tweet({
          text: content,
          media: { media_ids: uploadedMediaIds }
        });
        
      } catch (error: any) {
        console.error('Error uploading media:', error);
        return NextResponse.json(
          { error: 'Échec du téléchargement des médias: ' + (error.message || 'Unknown error') },
          { status: 500 }
        );
      }
    } else {
      // Post tweet without media
      console.log('Posting tweet without media');
      tweet = await client.v2.tweet({ text: content });
    }

    console.log('Tweet posted successfully with ID:', tweet.data.id);

    // Save the tweet in the database
    const savedTweet = await prisma.scheduledTweet.create({
      data: {
        content,
        status: 'PUBLISHED',
        scheduledFor: new Date(),
        userId: user.id,
        tweetId: tweet.data.id,
        source: 'studio',
      },
    });
    console.log('Tweet saved to database with ID:', savedTweet.id);

    // Save media information if present
    if (mediaUrls && mediaUrls.length > 0) {
      console.log('Saving media information to database');
      const mediaPromises = mediaUrls.map(url => 
        prisma.media.create({
          data: {
            tweetId: savedTweet.id,
            url: url,
            type: url.toLowerCase().endsWith('.mp4') ? 'VIDEO' : 'IMAGE',
          }
        })
      );
      
      await Promise.all(mediaPromises);
      console.log('Media information saved to database');
    }

    return NextResponse.json(savedTweet);
  } catch (error: any) {
    console.error('Erreur lors de la publication du tweet:', error);
    
    // Déterminer le type d'erreur
    let statusCode = 500;
    let errorMessage = 'Échec de la publication du tweet: ';
    
    if (error.message && error.message.includes('401')) {
      statusCode = 401;
      errorMessage += 'Problème d\'authentification Twitter. Veuillez vous reconnecter à votre compte Twitter.';
    } else if (error.message && error.message.includes('403')) {
      statusCode = 403;
      errorMessage += 'Action non autorisée par Twitter. Vérifiez les permissions de votre application.';
    } else if (error.message && error.message.includes('429')) {
      statusCode = 429;
      errorMessage += 'Limite de taux Twitter dépassée. Veuillez réessayer plus tard.';
    } else {
      errorMessage += error.message || 'Erreur inconnue';
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}
