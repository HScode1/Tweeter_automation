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
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    if (!body) {
      return NextResponse.json(
        { error: "Missing request body" },
        { status: 400 }
      );
    }

    const scheduledTweet = await prisma.scheduledTweet.create({
      data: {
        ...body,
        userId
      }
    });

    return NextResponse.json(scheduledTweet);
  } catch (error) {
    // Proper error logging with type checking
    if (error instanceof Error) {
      console.error("[SCHEDULE_POST]", {
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error("[SCHEDULE_POST]", error);
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}