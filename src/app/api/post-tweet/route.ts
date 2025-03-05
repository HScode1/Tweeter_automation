import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { decrypt } from '@/utils/encryption';
import { refreshTwitterToken } from '@/utils/refreshToken';
import { uploadMediaDirectly } from '../upload-media/route';

// Fonction utilitaire pour déterminer le type MIME
function getMimeType(filename: string, buffer: Buffer): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  if (buffer && buffer.length >= 8) {
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return 'image/jpeg';
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return 'image/png';
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) return 'image/gif';
  }
  switch (extension) {
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'png': return 'image/png';
    case 'gif': return 'image/gif';
    default: return 'image/png'; // Par défaut
  }
}

export async function POST(req: Request) {
  try {
    // Vérification de l'authentification
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupération des données de la requête
    const { content, mediaUrls } = await req.json();
    if (!content) {
      return NextResponse.json({ error: 'Le contenu du tweet est requis' }, { status: 400 });
    }

    // Récupération de l'utilisateur et du compte Twitter
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

    // Décryptage et rafraîchissement des tokens
    const decryptedAccessToken = decrypt(twitterAccount.accessToken);
    const decryptedRefreshToken = twitterAccount.refreshToken ? decrypt(twitterAccount.refreshToken) : '';
    const { accessToken } = await refreshTwitterToken(decryptedAccessToken, decryptedRefreshToken);

    // Upload des médias
    const mediaIds: string[] = [];
    if (mediaUrls && Array.isArray(mediaUrls) && mediaUrls.length > 0) {
      for (const mediaUrl of mediaUrls) {
        // Téléchargement de l'image depuis l'URL
        const response = await fetch(mediaUrl);
        if (!response.ok) {
          throw new Error(`Échec du téléchargement de l'image depuis ${mediaUrl}: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const mediaBuffer = Buffer.from(arrayBuffer);

        // Détermination du type MIME
        const filename = mediaUrl.split('/').pop() || 'image.png';
        const mimeType = getMimeType(filename, mediaBuffer);

        // Upload vers Twitter avec uploadMediaDirectly
        const mediaId = await uploadMediaDirectly(accessToken, mediaBuffer, mimeType);
        mediaIds.push(mediaId);

        // Sauvegarde dans la base de données (optionnel)
        await prisma.media.create({
          data: {
            tweet: { create: { content, userId: user.id, status: 'PENDING', scheduledFor: new Date() } },
            url: mediaUrl,
            type: mimeType.startsWith('video') ? 'VIDEO' : 'IMAGE',
          },
        });
      }
    }

    // Publication du tweet
    const tweetPayload: any = { text: content };
    if (mediaIds.length > 0) {
      tweetPayload.media = { media_ids: mediaIds };
    }

    const tweetResponse = await fetch('https://api.x.com/2/tweets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tweetPayload),
    });

    // Log de la réponse pour diagnostic
    console.log('Réponse de l\'API Twitter:', tweetResponse.status, tweetResponse.statusText);

    if (!tweetResponse.ok) {
      const errorText = await tweetResponse.text();
      console.error('Erreur de l\'API Twitter:', errorText);
      throw new Error(`Échec de la publication du tweet: ${errorText}`);
    }

    const tweetData = await tweetResponse.json();

    // Mise à jour du statut dans la base de données (optionnel)
    if (mediaIds.length > 0) {
      await prisma.scheduledTweet.updateMany({
        where: { content, userId: user.id, status: 'PENDING' },
        data: { status: 'PUBLISHED', tweetId: tweetData.data.id },
      });
    }

    return NextResponse.json({ success: true, tweet: tweetData });
  } catch (error) {
    // Gestion robuste de l'erreur
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur lors de la publication du tweet:', errorMessage);
    return NextResponse.json(
      { error: `Échec de la publication du tweet: ${errorMessage}` },
      { status: 500 }
    );
  }
}