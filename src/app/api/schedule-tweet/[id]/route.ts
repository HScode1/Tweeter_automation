import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

type Params = { id: string };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const resolvedParams = await params;
    const tweet = await prisma.scheduledTweet.findUnique({
      where: { id: resolvedParams.id, userId },
      include: { user: true },
    });
    if (!tweet) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 });
    }
    return NextResponse.json(tweet);
  } catch (error) {
    console.error('Error fetching scheduled tweet:', error);
    return NextResponse.json({ error: 'Failed to fetch tweet' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<Params> }
): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const resolvedParams = await params;
    const { content, scheduledFor, mediaIds, status } = await request.json();
    if (mediaIds && !Array.isArray(mediaIds)) {
      return NextResponse.json({ error: 'mediaIds must be an array' }, { status: 400 });
    }
    const tweet = await prisma.scheduledTweet.findUnique({
      where: { id: resolvedParams.id, userId },
      include: { user: true },
    });
    if (!tweet) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 });
    }
    const updatedTweet = await prisma.scheduledTweet.update({
      where: { id: resolvedParams.id },
      data: {
        content,
        status,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        media: {
          connect: mediaIds ? mediaIds.map((id: string) => ({ id })) : undefined,
        },
      },
      include: { media: true },
    });
    return NextResponse.json(updatedTweet);
  } catch (error) {
    console.error('Error updating scheduled tweet:', error);
    return NextResponse.json({ error: 'Failed to update tweet' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const resolvedParams = await params;
    const tweet = await prisma.scheduledTweet.findUnique({
      where: { id: resolvedParams.id, userId },
      include: { user: true },
    });
    if (!tweet) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 });
    }
    await prisma.scheduledTweet.delete({ where: { id: resolvedParams.id } });
    return NextResponse.json({ message: 'Tweet deleted successfully' });
  } catch (error) {
    console.error('Error deleting scheduled tweet:', error);
    return NextResponse.json({ error: 'Failed to delete tweet' }, { status: 500 });
  }
}
