import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Récupérer l'utilisateur par son clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer tous les tweets programmés de l'utilisateur
    const tweets = await prisma.scheduledTweet.findMany({
      where: { userId: user.id },
      orderBy: { scheduledFor: "desc" },
      include: {
        media: true,
        metrics: true
      }
    });

    return NextResponse.json(tweets);
  } catch (error) {
    // Logging d'erreur
    if (error instanceof Error) {
      console.error("[SCHEDULED_TWEETS_GET]", {
        message: error.message,        
        stack: error.stack
      });
    } else {
      console.error("[SCHEDULED_TWEETS_GET]", error);
    }
    
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
