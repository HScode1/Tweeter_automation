import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Non autorisé", { status: 401 });
    }

    const { content, scheduledFor } = await req.json();

    if (!content || !scheduledFor) {
      return new NextResponse("Données manquantes", { status: 400 });
    }

    // Créer une nouvelle entrée de tweet programmé
    const scheduledTweet = await prisma.scheduledTweet.create({
      data: {
        content,
        scheduledFor: new Date(scheduledFor),
        userId,
        status: "PENDING"
      }
    });

    return NextResponse.json(scheduledTweet);
  } catch (error) {
    console.error("[SCHEDULE_POST]", error);
    return new NextResponse("Erreur Interne", { status: 500 });
  }
}
