import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        accounts: {
          select: {
            id: true,
            platform: true,
            username: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      // If user doesn't exist, return an empty array
      return NextResponse.json({ accounts: [] });
    }

    return NextResponse.json({ accounts: user.accounts });
  } catch (error) {
    console.log('Error type:', typeof error);
    console.log('Error value:', error);
    if (error instanceof Error) {
      console.log('Error message:', error.message);
      console.log('Error stack:', error.stack);
    } else {
      console.log('Non-Error exception caught:', error);
    }
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ accounts: [], error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action !== 'disconnect') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      select: {
        id: true,
        accounts: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete the Twitter account
    await prisma.account.deleteMany({
      where: {
        userId: user.id,
        platform: 'twitter',
      },
    });

    return NextResponse.json({ message: 'Account disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting account:', error);
    return NextResponse.json({ error: 'Failed to disconnect account' }, { status: 500 });
  }
}