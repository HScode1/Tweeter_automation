import { NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {  // Ajoutez un underscore
  const authData = await auth();
  const { userId } = authData;
  if (!userId) return new NextResponse("Non autorisé", { status: 401 });

  try {
    const tweets = await prisma.scheduledTweet.findMany({
      where: { userId },
      orderBy: { scheduledFor: "asc" }
    });
    return NextResponse.json(tweets);
  } catch (error) {
    console.error("[SCHEDULED_TWEETS_GET]", error);
    return new NextResponse("Erreur Interne", { status: 500 });
  }
}
