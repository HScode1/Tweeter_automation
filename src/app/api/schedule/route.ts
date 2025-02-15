import { NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) return new NextResponse("Non autorisé", { status: 401 });

    const { content, scheduledFor } = await req.json();
    if (!content || !scheduledFor) {
      return new NextResponse("Données manquantes", { status: 400 });
    }

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
