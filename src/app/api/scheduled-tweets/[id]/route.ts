import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Get a specific scheduled tweet
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tweet = await prisma.scheduledTweet.findUnique({
      where: {
        id: params.id,
        user: { email: session.user.email },
      },
    });

    if (!tweet) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 });
    }

    return NextResponse.json(tweet);
  } catch (error) {
    console.error('Error fetching scheduled tweet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tweet' },
      { status: 500 }
    );
  }
}

// Update a scheduled tweet
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, scheduledFor, mediaIds } = await req.json();

    const tweet = await prisma.scheduledTweet.findUnique({
      where: {
        id: params.id,
        user: { email: session.user.email },
      },
    });

    if (!tweet) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 });
    }

    const updatedTweet = await prisma.scheduledTweet.update({
      where: { id: params.id },
      data: {
        content,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        mediaIds,
      },
    });

    return NextResponse.json(updatedTweet);
  } catch (error) {
    console.error('Error updating scheduled tweet:', error);
    return NextResponse.json(
      { error: 'Failed to update tweet' },
      { status: 500 }
    );
  }
}

// Delete a scheduled tweet
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tweet = await prisma.scheduledTweet.findUnique({
      where: {
        id: params.id,
        user: { email: session.user.email },
      },
    });

    if (!tweet) {
      return NextResponse.json({ error: 'Tweet not found' }, { status: 404 });
    }

    await prisma.scheduledTweet.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Tweet deleted successfully' });
  } catch (error) {
    console.error('Error deleting scheduled tweet:', error);
    return NextResponse.json(
      { error: 'Failed to delete tweet' },
      { status: 500 }
    );
  }
}
