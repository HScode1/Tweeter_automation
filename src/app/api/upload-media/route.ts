import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/auth.config';
import { TwitterApi } from 'twitter-api-v2';
import prisma from '@/lib/prisma';
import { MediaType } from '@prisma/client';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { accounts: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    // Récupérer le compte Twitter
    const twitterAccount = user.accounts.find(
      (account) => account.platform === 'twitter'
    );
    if (!twitterAccount || !twitterAccount.token) {
      return NextResponse.json(
        { error: 'Compte Twitter non connecté ou token invalide' },
        { status: 400 }
      );
    }

    // Parse the stored token to get access token and secret
    const [accessToken, accessSecret] = twitterAccount.token.split('|');
    if (!accessToken || !accessSecret) {
      return NextResponse.json(
        { error: 'Token Twitter invalide' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier invalide' },
        { status: 400 }
      );
    }

    // Vérifier la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux' },
        { status: 400 }
      );
    }

    // Initialiser le client Twitter
    const client = new TwitterApi({
      appKey: accessToken,
      appSecret: accessSecret,
    });

    // Envoyer le média sur Twitter
    const buffer = await file.arrayBuffer();
    const mediaId = await client.v1.uploadMedia(Buffer.from(buffer), {
      mimeType: file.type,
    });

    // Déterminer le type de média
    let mediaType: MediaType;
    if (file.type.startsWith('image/gif')) {
      mediaType = MediaType.GIF;
    } else if (file.type.startsWith('image/')) {
      mediaType = MediaType.IMAGE;
    } else if (file.type.startsWith('video/')) {
      mediaType = MediaType.VIDEO;
    } else {
      return NextResponse.json(
        { error: 'Type de média non supporté' },
        { status: 400 }
      );
    }

    // Create a scheduled tweet first
    const scheduledTweet = await prisma.scheduledTweet.create({
      data: {
        content: '', // Empty content for media-only tweet
        scheduledFor: new Date(), // Schedule for immediate posting
        userId: user.id,
      },
    });

    // Enregistrer les informations du média
    const media = await prisma.media.create({
      data: {
        tweetId: scheduledTweet.id,
        url: `https://twitter.com/i/media/${mediaId}`, // Twitter media URL format
        type: mediaType,
      },
    });

    return NextResponse.json({ media, scheduledTweet });
  } catch (error) {
    console.error('Erreur lors du téléchargement du média :', error);
    return NextResponse.json(
      { error: 'Échec du téléchargement du média' },
      { status: 500 }
    );
  }
}
