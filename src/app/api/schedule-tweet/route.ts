import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// GET endpoint to fetch scheduled tweets
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const tweets = await prisma.scheduledTweet.findMany({
      where: { userId },
      orderBy: { scheduledFor: "asc" }
    });

    return NextResponse.json(tweets);
  } catch (error) {
    // Proper error logging with type checking
    if (error instanceof Error) {
      console.error("[SCHEDULED_TWEETS_GET]", {
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error("[SCHEDULED_TWEETS_GET]", error);
    }
    
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST endpoint to create scheduled tweet
export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { content, scheduledAt } = await req.json();

    if (!content || typeof content !== 'string' || content.length > 280) {
      return NextResponse.json({ error: 'Contenu du tweet invalide' }, { status: 400 });
    }

    if (!scheduledAt || new Date(scheduledAt) <= new Date()) {
      return NextResponse.json({ error: 'Date de programmation invalide' }, { status: 400 });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Schedule the tweet in the database
    const scheduledTweet = await prisma.scheduledTweet.create({
      data: {
        content,
        scheduledFor: new Date(scheduledAt),
        status: 'SCHEDULED',
        userId: user.id,
      },
    });

    return NextResponse.json(scheduledTweet);
  } catch (error) {
    console.error('Erreur lors de la programmation du tweet:', error);
    return NextResponse.json(
      { error: 'Échec de la programmation du tweet' },
      { status: 500 }
    );
  }
}