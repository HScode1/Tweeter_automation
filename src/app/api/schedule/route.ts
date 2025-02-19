import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // First, verify or create the user in the database
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      // Get user data from Clerk auth if needed
      const authData = await auth();
      
      // Create the user if they don't exist
      user = await prisma.user.create({
        data: {
          id: userId,
          clerkId: userId,
          email: authData.sessionClaims?.email as string || '',
          name: authData.sessionClaims?.firstName as string || 'Unknown',
        }
      });
    }

    const body = await req.json();
    const { content, scheduledFor } = body;

    if (!content || !scheduledFor) {
      return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
    }

    const scheduledTweet = await prisma.scheduledTweet.create({
      data: {
        content,
        scheduledFor: new Date(scheduledFor),
        userId: user.id,  // Now we're sure this user exists
        status: "PENDING"
      }
    });

    return NextResponse.json(scheduledTweet);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("[SCHEDULE_POST]", { error: errorMessage });
    
    if (errorMessage.includes("Foreign key constraint")) {
      return NextResponse.json(
        { error: "Erreur d'authentification - Utilisateur non trouvé" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Erreur Interne" },
      { status: 500 }
    );
  }
}