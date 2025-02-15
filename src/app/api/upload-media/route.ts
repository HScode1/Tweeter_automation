import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { TwitterApi } from 'twitter-api-v2';
import { prisma } from '@/lib/prisma';

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large' },
        { status: 400 }
      );
    }

    // Initialize Twitter client
    const client = new TwitterApi({
      accessToken: twitterAccount.access_token,
      accessSecret: twitterAccount.access_token_secret,
    });

    // Upload media to Twitter
    const buffer = await file.arrayBuffer();
    const mediaId = await client.v1.uploadMedia(Buffer.from(buffer), {
      mimeType: file.type,
    });

    // Save media information
    const media = await prisma.media.create({
      data: {
        mediaId: mediaId,
        type: file.type,
        userId: user.id,
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}
