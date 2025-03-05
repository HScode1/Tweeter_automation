import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { decrypt } from '@/utils/encryption';
import { refreshTwitterToken } from '@/utils/refreshToken';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Helper function to determine MIME type from buffer or filename
function getMimeType(filename: string, buffer?: Buffer): string {
  // Try to determine from buffer content first if available
  if (buffer && buffer.length >= 8) {
    // Check for JPEG signatures
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      console.log('MIME type detected from buffer content: image/jpeg');
      return 'image/jpeg';
    }
    
    // Check for PNG signature
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
        buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A) {
      console.log('MIME type detected from buffer content: image/png');
      return 'image/png';
    }
    
    // Check for GIF signatures
    if ((buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38 && 
        (buffer[4] === 0x37 || buffer[4] === 0x39) && buffer[5] === 0x61)) {
      console.log('MIME type detected from buffer content: image/gif');
      return 'image/gif';
    }
    
    // Add more signature checks as needed for other formats
  }
  
  // Fallback to file extension if buffer check didn't work
  console.log('Falling back to extension-based MIME type detection');
  const extension = filename.split('.').pop()?.toLowerCase();
  
  if (extension) {
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      case 'mp4':
        return 'video/mp4';
      default:
        // Default to png if extension is unknown
        return 'image/png';
    }
  }
  
  // Default to png if we can't determine
  return 'image/png';
}

// Helper function to get the X API media category based on file type
function getMediaCategory(mimeType: string): string {
  if (mimeType.startsWith('video/')) {
    return 'tweet_video';
  } else if (mimeType === 'image/gif') {
    return 'tweet_gif';
  } else if (mimeType.startsWith('image/')) {
    return 'tweet_image';
  }
  return 'tweet_image'; // Default
}

// Direct implementation of X API media upload using fetch requests
async function uploadMediaDirectly(accessToken: string, mediaBuffer: Buffer, mimeType: string): Promise<string> {
  const totalBytes = mediaBuffer.length;
  const mediaCategory = getMediaCategory(mimeType);
  console.log('La catégorie du Media renvoyéé par la fonction getMediaCategory est:', mediaCategory);
  
  console.log(`Starting direct media upload: type=${mimeType}, size=${totalBytes} bytes, category=${mediaCategory}`);
  
  try {
    // STEP 1: INIT - Initialize the upload
    console.log('INIT: Initializing media upload');
    
    const formDataInit = new FormData();
    formDataInit.append('command', 'INIT');
    formDataInit.append('total_bytes', totalBytes.toString());
    formDataInit.append('media_type', mimeType);
    formDataInit.append('media_category', mediaCategory);
    
    const initResponse = await fetch('https://api.x.com/2/media/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formDataInit
    });
    
    if (!initResponse.ok) {
      const errorText = await initResponse.text();
      throw new Error(`INIT request failed with status ${initResponse.status}: ${errorText}`);
    }
    
    const initData = await initResponse.json();
    const mediaId = initData.data.id;
    
    console.log(`INIT complete, received media_id: ${mediaId}`);
    
    // STEP 2: APPEND - Upload the media in chunks
    console.log('APPEND: Uploading media chunks');
    const chunkSize = 1024 * 1024; // 1MB chunks
    const chunksCount = Math.ceil(totalBytes / chunkSize);
    
    for (let i = 0; i < chunksCount; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, totalBytes);
      const chunk = mediaBuffer.slice(start, end);
      
      console.log(`Uploading chunk ${i+1}/${chunksCount} (${chunk.length} bytes)`);
      
      // Create a Blob from the Buffer chunk
      const blob = new Blob([chunk]);
      
      const formDataAppend = new FormData();
      formDataAppend.append('command', 'APPEND');
      formDataAppend.append('media_id', mediaId);
      formDataAppend.append('segment_index', i.toString());
      formDataAppend.append('media', blob);
      
      const appendResponse = await fetch('https://api.x.com/2/media/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: formDataAppend
      });
      
      if (!appendResponse.ok) {
        const errorText = await appendResponse.text();
        throw new Error(`APPEND request failed for chunk ${i+1} with status ${appendResponse.status}: ${errorText}`);
      }
      
      console.log(`Chunk ${i+1} uploaded successfully`);
    }
    
    console.log('APPEND complete, all chunks uploaded');
   
    // STEP 3: FINALIZE - Finalize the upload
    console.log('FINALIZE: Finalizing media upload');
    
    const formDataFinalize = new FormData();
    formDataFinalize.append('command', 'FINALIZE');
    formDataFinalize.append('media_id', mediaId);
    
    const finalizeResponse = await fetch('https://api.x.com/2/media/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: formDataFinalize
    });
    
    if (!finalizeResponse.ok) {
      const errorText = await finalizeResponse.text();
      throw new Error(`FINALIZE request failed with status ${finalizeResponse.status}: ${errorText}`);
    }
    
    const finalizeData = await finalizeResponse.json();
    console.log('FINALIZE response:', finalizeData);
    
    // STEP 4: Check processing status if needed (especially for videos)
    if (finalizeData.data.processing_info) {
      console.log('Media requires processing:', finalizeData.data.processing_info);
      
      let processingInfo = finalizeData.data.processing_info;
      
      while (processingInfo && processingInfo.state !== 'succeeded' && processingInfo.state !== 'failed') {
        const checkAfterSecs = processingInfo.check_after_secs || 1;
        console.log(`Media still processing (${processingInfo.state}), checking again in ${checkAfterSecs} seconds...`);
        
        // Wait for the recommended time
        await new Promise(resolve => setTimeout(resolve, checkAfterSecs * 1000));
        
        // Check status
        const statusResponse = await fetch(`https://api.x.com/2/media/upload?command=STATUS&media_id=${mediaId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          throw new Error(`STATUS request failed with status ${statusResponse.status}: ${errorText}`);
        }
        
        const statusData = await statusResponse.json();
        processingInfo = statusData.data.processing_info;
        
        console.log(`Processing update: ${processingInfo ? processingInfo.state : 'complete'} (${processingInfo ? processingInfo.progress_percent || 0 : 100}%)`);
      }
      
      if (processingInfo && processingInfo.state === 'failed') {
        throw new Error(`Media processing failed: ${processingInfo.error?.message || 'Unknown error'}`);
      }
      
      console.log('Media processing complete');
    }
    
    return mediaId;
    
  } catch (error) {
    console.error('Error in direct media upload:', error);
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    console.log('Starting upload-media API request');
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Check the content type
    const contentType = req.headers.get('content-type') || '';
    console.log('Request Content-Type:', contentType);
    
    let mediaBuffer: Buffer;
    let filename: string = '';
    let mediaUrl: string = '';
    
    // Handle binary request
    if (contentType.includes('application/octet-stream')) {
      try {
        // Read the request body as a buffer
        const arrayBuffer = await req.arrayBuffer();
        mediaBuffer = Buffer.from(arrayBuffer);
        
        // Extract filename from headers
        const contentDisposition = req.headers.get('content-disposition');
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }
        
        // Extract the actual file path from data-raw if possible
        const rawDataHeader = req.headers.get('x-raw-data-path');
        if (rawDataHeader) {
          // Use the actual file path instead of the content-disposition filename
          const actualPath = rawDataHeader;
          const actualFilename = path.basename(actualPath);
          console.log(`Detected actual file path: ${actualPath}, filename: ${actualFilename}`);
          // Only use this if it seems valid
          if (actualFilename && actualFilename.includes('.')) {
            filename = actualFilename;
          }
        }
        
        console.log(`Received file: ${filename}, size: ${mediaBuffer.length} bytes`);
      } catch (error) {
        console.error('Error processing binary data:', error);
        return NextResponse.json({ 
          error: 'Erreur lors du traitement des données binaires: ' + (error instanceof Error ? error.message : 'Unknown error') 
        }, { status: 400 });
      }
    } else if (contentType.includes('application/json')) {
      try {
        const jsonData = await req.json();
        mediaUrl = jsonData.mediaUrl;
        
        if (!mediaUrl || typeof mediaUrl !== 'string') {
          return NextResponse.json({ error: 'URL média invalide' }, { status: 400 });
        }
        
        console.log('Fetching media from URL:', mediaUrl.substring(0, 30) + '...');
        const response = await fetch(mediaUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        mediaBuffer = Buffer.from(arrayBuffer);
        
        // Extract filename from URL
        const urlParts = mediaUrl.split('/');
        filename = urlParts[urlParts.length - 1];
        
        console.log(`Successfully fetched media, size: ${mediaBuffer.length} bytes`);
      } catch (error) {
        console.error('Error processing JSON data:', error);
        return NextResponse.json({ 
          error: 'Erreur lors du traitement des données JSON: ' + (error instanceof Error ? error.message : 'Unknown error') 
        }, { status: 400 });
      }
    } else {
      return NextResponse.json({ 
        error: 'Format de requête non pris en charge. Veuillez utiliser application/json avec une URL de média ou application/octet-stream avec un fichier binaire' 
      }, { status: 400 });
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

    try {
      // Determine MIME type
      const mimeType = getMimeType(filename, mediaBuffer);
      console.log(`Uploading with MIME type: ${mimeType}`);
      console.log(`Format MIME détecté: ${mimeType} pour le fichier ${filename}`);
      
      // Use direct API calls to upload media following X API documentation
      console.log('Using direct API calls with fetch for media upload');
      const mediaId = await uploadMediaDirectly(accessToken, mediaBuffer, mimeType);
      
      console.log(`Successfully uploaded media with ID: ${mediaId}`);
      
      // Save the media information to the database
      const savedMedia = await prisma.media.create({
        data: {
          userId: user.id,
          url: mediaUrl || filename, // Use URL if available, otherwise use filename
          type: mimeType.startsWith('video') ? 'VIDEO' : 'IMAGE',
          twitterMediaId: mediaId
        }
      });
      
      console.log('Media saved to database with ID:', savedMedia.id);
      
      return NextResponse.json({ 
        mediaId,
        success: true,
        mediaInfo: savedMedia
      });
    } catch (error: any) {
      console.error('Error uploading media:', error);
      
      // Detailed error logging
      console.error(`========= ERROR DETAILS FOR MEDIA UPLOAD =========`);
      console.error(`Error message: ${error.message}`);
      console.error(`Error code: ${error.code || 'N/A'}`);
      console.error(`Error type: ${error.type || 'N/A'}`);
      
      // Log headers if they exist
      if (error.headers) {
        console.error('Error headers:');
        console.error(JSON.stringify(error.headers, null, 2));
        
        // Check for Twitter-specific error headers
        if (error.headers['x-response-body']) {
          try {
            const responseBody = JSON.parse(error.headers['x-response-body']);
            console.error('Twitter API response body:');
            console.error(JSON.stringify(responseBody, null, 2));
          } catch (e) {
            console.error('Raw x-response-body:', error.headers['x-response-body']);
          }
        }
        
        // Check for other important headers
        if (error.headers['x-twitter-response-tags']) {
          console.error('Twitter response tags:', error.headers['x-twitter-response-tags']);
        }
      }
      
      // Log all error properties
      console.error('All error properties:');
      for (const prop in error) {
        if (prop !== 'headers') {
          try {
            console.error(`${prop}:`, JSON.stringify(error[prop], null, 2));
          } catch (e) {
            console.error(`${prop} (non-stringifiable):`, error[prop]);
          }
        }
      }
      
      console.error('Full error object:');
      console.error(error);
      console.error('================================================');
      
      return NextResponse.json(
        { error: 'Échec du téléchargement du média: ' + (error.message || 'Unknown error') },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Erreur lors du téléchargement du média:', error);
    
    // Determine error type
    let statusCode = 500;
    let errorMessage = 'Échec du téléchargement du média: ';
    
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
};