import { NextResponse, Request } from "next/server";
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



// Types pour une meilleure gestion des erreurs
interface ScheduleTweetBody {
  content: string;
  scheduledAt: string;
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    let body: ScheduleTweetBody;
    try {
      body = await req.json();
      console.log("Received body:", body);
      
      if (!body || typeof body !== "object") {
        throw new Error("Corps de la requête invalide");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Format de requête invalide";
      console.error("Erreur de parsing JSON:", errorMessage);
      return NextResponse.json(
        { error: "Format de requête invalide" },
        { status: 400 }
      );
    }

    const { content, scheduledAt } = body;

    // Validations avec logs détaillés
    if (!content || typeof content !== "string") {
      console.log("Validation échec - content type:", { 
        content, 
        type: typeof content 
      });
      return NextResponse.json({ 
        error: "Le contenu du tweet doit être une chaîne de caractères" 
      }, { status: 400 });
    }

    if (content.length > 280) {
      console.log("Validation échec - content length:", { 
        length: content.length 
      });
      return NextResponse.json({ 
        error: "Le contenu du tweet ne doit pas dépasser 280 caractères" 
      }, { status: 400 });
    }

    if (!scheduledAt || typeof scheduledAt !== "string") {
      console.log("Validation échec - scheduledAt type:", { 
        scheduledAt, 
        type: typeof scheduledAt 
      });
      return NextResponse.json({ 
        error: "La date de programmation doit être une chaîne de caractères" 
      }, { status: 400 });
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      console.log("Validation échec - scheduledAt format:", { scheduledAt });
      return NextResponse.json({ 
        error: "Format de date invalide" 
      }, { status: 400 });
    }

    if (scheduledDate <= new Date()) {
      console.log("Validation échec - scheduledAt passé:", { 
        scheduledAt, 
        now: new Date() 
      });
      return NextResponse.json({ 
        error: "La date de programmation doit être dans le futur" 
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      console.log("Utilisateur non trouvé:", { userId, clerkId: userId });
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    console.log("Création du tweet programmé:", {
      content,
      scheduledFor: scheduledDate,
      userId: user.id
    });

    const scheduledTweet = await prisma.scheduledTweet.create({
      data: {
        content,
        scheduledFor: scheduledDate,
        status: "SCHEDULED",
        userId: user.id,
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: scheduledTweet 
    });
  } catch (error) {
    // Gestion améliorée des erreurs
    if (error instanceof Error) {
      console.error("Erreur lors de la programmation du tweet:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    } else if (error === null) {
      console.error("Erreur null lors de la programmation du tweet");
    } else if (error === undefined) {
      console.error("Erreur undefined lors de la programmation du tweet");
    } else {
      console.error("Erreur inconnue lors de la programmation du tweet:", error);
    }

    // Réponse d'erreur avec plus de contexte si disponible
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Échec de la programmation du tweet";

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.name : undefined
      },
      { status: 500 }
    );
  }
}