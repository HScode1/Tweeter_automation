import { openai } from './openai';

interface ContentGenerationOptions {
  transcription: string;
  contentType: 'tweets' | 'thread' | 'carousel';
  outputLanguage?: string;
}

// Mapping des langues pour les prompts système et utilisateur
const languagePrompts: Record<string, Record<string, {system: string, user: string}>> = {
  fr: {
    tweets: {
      system: "Tu es un expert en marketing digital. Ta tâche est de générer 3 tweets accrocheurs et viraux à partir d'une transcription vidéo.",
      user: (transcription: string) => `Voici la transcription d'une vidéo:\n\n${transcription}\n\nGénère 3 tweets accrocheurs et viraux qui résument les points clés. Chaque tweet doit faire moins de 280 caractères. Format: un tweet par ligne.`
    },
    thread: {
      system: "Tu es un expert en marketing digital. Ta tâche est de générer un thread Twitter accrocheur et viral à partir d'une transcription vidéo. Le thread doit contenir entre 3 et 5 tweets.",
      user: (transcription: string) => `Voici la transcription d'une vidéo:\n\n${transcription}\n\nGénère un thread Twitter accrocheur et viral qui résume les points clés. Le thread doit contenir entre 3 et 5 tweets. Format: un tweet par ligne.`
    },
    carousel: {
      system: "Tu es un expert en synthèse et vulgarisation. Ta tâche est d'extraire les idées principales d'une vidéo et de les présenter de manière claire et concise.",
      user: (transcription: string) => `Voici la transcription de la vidéo:\n\n${transcription}\n\nCrée un résumé des points clés de cette vidéo. Format souhaité :\n1. Un titre accrocheur\n2. 3-5 idées principales (une ligne par idée)\n3. Une conclusion/takeaway\n\nChaque point doit être clair et concis.`
    }
  },
  en: {
    tweets: {
      system: "You are a digital marketing expert. Your task is to generate 3 catchy and viral tweets from a video transcription.",
      user: (transcription: string) => `Here's a video transcription:\n\n${transcription}\n\nGenerate 3 catchy and viral tweets that summarize the key points. Each tweet must be less than 280 characters. Format: one tweet per line.`
    },
    thread: {
      system: "You are a digital marketing expert. Your task is to generate a catchy and viral Twitter thread from a video transcription. The thread should contain between 3 and 5 tweets.",
      user: (transcription: string) => `Here's a video transcription:\n\n${transcription}\n\nGenerate a catchy and viral Twitter thread that summarizes the key points. The thread should contain between 3 and 5 tweets. Format: one tweet per line.`
    },
    carousel: {
      system: "You are an expert in synthesis and popularization. Your task is to extract the main ideas from a video and present them clearly and concisely.",
      user: (transcription: string) => `Here is the video transcription:\n\n${transcription}\n\nCreate a summary of the key points from this video. Desired format:\n1. A catchy title\n2. 3-5 main ideas (one line per idea)\n3. A conclusion/takeaway\n\nEach point should be clear and concise.`
    }
  },
  es: {
    tweets: {
      system: "Eres un experto en marketing digital. Tu tarea es generar 3 tweets atractivos y virales a partir de una transcripción de video.",
      user: (transcription: string) => `Aquí está la transcripción de un video:\n\n${transcription}\n\nGenera 3 tweets atractivos y virales que resuman los puntos clave. Cada tweet debe tener menos de 280 caracteres. Formato: un tweet por línea.`
    },
    thread: {
      system: "Eres un experto en marketing digital. Tu tarea es generar un hilo de Twitter atractivo y viral a partir de una transcripción de video. El hilo debe contener entre 3 y 5 tweets.",
      user: (transcription: string) => `Aquí está la transcripción de un video:\n\n${transcription}\n\nGenera un hilo de Twitter atractivo y viral que resuma los puntos clave. El hilo debe contener entre 3 y 5 tweets. Formato: un tweet por línea.`
    },
    carousel: {
      system: "Eres un experto en síntesis y divulgación. Tu tarea es extraer las ideas principales de un video y presentarlas de forma clara y concisa.",
      user: (transcription: string) => `Aquí está la transcripción del video:\n\n${transcription}\n\nCrea un resumen de los puntos clave de este video. Formato deseado:\n1. Un título atractivo\n2. 3-5 ideas principales (una línea por idea)\n3. Una conclusión\n\nCada punto debe ser claro y conciso.`
    }
  },
  de: {
    tweets: {
      system: "Du bist ein Experte für digitales Marketing. Deine Aufgabe ist es, 3 einprägsame und virale Tweets aus einer Videotranskription zu generieren.",
      user: (transcription: string) => `Hier ist eine Videotranskription:\n\n${transcription}\n\nGeneriere 3 einprägsame und virale Tweets, die die wichtigsten Punkte zusammenfassen. Jeder Tweet muss weniger als 280 Zeichen haben. Format: ein Tweet pro Zeile.`
    },
    thread: {
      system: "Du bist ein Experte für digitales Marketing. Deine Aufgabe ist es, einen einprägsamen und viralen Twitter-Thread aus einer Videotranskription zu generieren. Der Thread sollte zwischen 3 und 5 Tweets enthalten.",
      user: (transcription: string) => `Hier ist eine Videotranskription:\n\n${transcription}\n\nGeneriere einen einprägsamen und viralen Twitter-Thread, der die wichtigsten Punkte zusammenfasst. Der Thread sollte zwischen 3 und 5 Tweets enthalten. Format: ein Tweet pro Zeile.`
    },
    carousel: {
      system: "Du bist ein Experte für Synthese und Popularisierung. Deine Aufgabe ist es, die Hauptideen aus einem Video zu extrahieren und sie klar und prägnant zu präsentieren.",
      user: (transcription: string) => `Hier ist die Videotranskription:\n\n${transcription}\n\nErstelle eine Zusammenfassung der wichtigsten Punkte aus diesem Video. Gewünschtes Format:\n1. Ein einprägsamer Titel\n2. 3-5 Hauptideen (eine Zeile pro Idee)\n3. Ein Fazit\n\nJeder Punkt sollte klar und prägnant sein.`
    }
  },
  it: {
    tweets: {
      system: "Sei un esperto di marketing digitale. Il tuo compito è generare 3 tweet accattivanti e virali da una trascrizione video.",
      user: (transcription: string) => `Ecco una trascrizione video:\n\n${transcription}\n\nGenera 3 tweet accattivanti e virali che riassumono i punti chiave. Ogni tweet deve avere meno di 280 caratteri. Formato: un tweet per riga.`
    },
    thread: {
      system: "Sei un esperto di marketing digitale. Il tuo compito è generare un thread Twitter accattivante e virale da una trascrizione video. Il thread dovrebbe contenere tra 3 e 5 tweet.",
      user: (transcription: string) => `Ecco una trascrizione video:\n\n${transcription}\n\nGenera un thread Twitter accattivante e virale che riassume i punti chiave. Il thread dovrebbe contenere tra 3 e 5 tweet. Formato: un tweet per riga.`
    },
    carousel: {
      system: "Sei un esperto di sintesi e divulgazione. Il tuo compito è estrarre le idee principali da un video e presentarle in modo chiaro e conciso.",
      user: (transcription: string) => `Ecco la trascrizione del video:\n\n${transcription}\n\nCrea un riepilogo dei punti chiave di questo video. Formato desiderato:\n1. Un titolo accattivante\n2. 3-5 idee principali (una riga per idea)\n3. Una conclusione\n\nOgni punto dovrebbe essere chiaro e conciso.`
    }
  },
  pt: {
    tweets: {
      system: "Você é um especialista em marketing digital. Sua tarefa é gerar 3 tweets cativantes e virais a partir de uma transcrição de vídeo.",
      user: (transcription: string) => `Aqui está uma transcrição de vídeo:\n\n${transcription}\n\nGere 3 tweets cativantes e virais que resumam os principais pontos. Cada tweet deve ter menos de 280 caracteres. Formato: um tweet por linha.`
    },
    thread: {
      system: "Você é um especialista em marketing digital. Sua tarefa é gerar um thread do Twitter cativante e viral a partir de uma transcrição de vídeo. O thread deve conter entre 3 e 5 tweets.",
      user: (transcription: string) => `Aqui está uma transcrição de vídeo:\n\n${transcription}\n\nGere um thread do Twitter cativante e viral que resuma os principais pontos. O thread deve conter entre 3 e 5 tweets. Formato: um tweet por linha.`
    },
    carousel: {
      system: "Você é um especialista em síntese e divulgação. Sua tarefa é extrair as principais ideias de um vídeo e apresentá-las de forma clara e concisa.",
      user: (transcription: string) => `Aqui está a transcrição do vídeo:\n\n${transcription}\n\nCrie um resumo dos principais pontos deste vídeo. Formato desejado:\n1. Um título cativante\n2. 3-5 ideias principais (uma linha por ideia)\n3. Uma conclusão\n\nCada ponto deve ser claro e conciso.`
    }
  }
};

/**
 * Génère du contenu à partir d'une transcription selon le type demandé et la langue
 * @param options Options de génération de contenu
 * @returns Tableau de résultats (tweets, points de carousel, etc.)
 */
export async function generateContent({
  transcription,
  contentType,
  outputLanguage = 'fr'
}: ContentGenerationOptions): Promise<string[]> {
  // Vérifier si la langue est supportée, sinon utiliser français par défaut
  const supportedLanguages = Object.keys(languagePrompts);
  const language = supportedLanguages.includes(outputLanguage) ? outputLanguage : 'fr';
  
  // Récupérer le contentType correct pour la recherche dans les prompts
  const contentTypeKey = contentType === 'carousel' ? 'carousel' : contentType;
  
  // Obtenir les prompts pour cette langue et ce type de contenu
  const prompts = languagePrompts[language][contentTypeKey];
  
  if (!prompts) {
    throw new Error(`Type de contenu non pris en charge: ${contentType}`);
  }
  
  // Appel à l'API OpenAI
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: prompts.system },
      { role: "user", content: prompts.user(transcription) }
    ],
    temperature: 0.7,
  });
  
  const content = completion.choices[0]?.message?.content ?? "";
  return content.split("\n").filter(line => line.trim().length > 0);
}