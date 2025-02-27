import { openai } from './openai';

interface ContentGenerationOptions {
  transcription: string;
  contentType: 'tweets' | 'thread' | 'carousel';
}

/**
 * Génère du contenu à partir d'une transcription selon le type demandé
 * @param options Options de génération de contenu
 * @returns Tableau de résultats (tweets, points de carousel, etc.)
 */
export async function generateContent({ 
  transcription, 
  contentType 
}: ContentGenerationOptions): Promise<string[]> {
  let systemPrompt = '';
  let userPrompt = '';

  switch (contentType) {
    case 'tweets':
      systemPrompt = "Tu es un expert en marketing digital. Ta tâche est de générer 3 tweets accrocheurs et viraux à partir d'une transcription vidéo.";
      userPrompt = `Voici la transcription d'une vidéo:\n\n${transcription}\n\nGénère 3 tweets accrocheurs et viraux qui résument les points clés. Chaque tweet doit faire moins de 280 caractères. Format: un tweet par ligne.`;
      break;
    case 'thread':
      systemPrompt = "Tu es un expert en marketing digital. Ta tâche est de générer un thread Twitter accrocheur et viral à partir d'une transcription vidéo. Le thread doit contenir entre 3 et 5 tweets.";
      userPrompt = `Voici la transcription d'une vidéo:\n\n${transcription}\n\nGénère un thread Twitter accrocheur et viral qui résume les points clés. Le thread doit contenir entre 3 et 5 tweets. Format: un tweet par ligne.`;
      break;
    case 'carousel':
      systemPrompt = "Tu es un expert en synthèse et vulgarisation. Ta tâche est d'extraire les idées principales d'une vidéo et de les présenter de manière claire et concise.";
      userPrompt = `Voici la transcription de la vidéo:\n\n${transcription}\n\nCrée un résumé des points clés de cette vidéo. Format souhaité :\n1. Un titre accrocheur\n2. 3-5 idées principales (une ligne par idée)\n3. Une conclusion/takeaway\n\nChaque point doit être clair et concis.`;
      break;
    default:
      throw new Error(`Type de contenu non pris en charge: ${contentType}`);
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.7,
  });

  const content = completion.choices[0]?.message?.content ?? "";
  return content.split("\n").filter(line => line.trim().length > 0);
}
