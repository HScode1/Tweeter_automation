'use server';

import { NextResponse } from 'next/server';
import { 
  downloadVideoAndExtractAudio, 
  transcribeAudio,
  cleanupFiles
} from '@/lib/fileUtils';
import { generateContent } from '@/lib/contentGenerator';

export async function POST(req: Request) {
  const tempFiles: string[] = [];

  try {
    console.log('Début du traitement API');
    const { videoUrl, contentType } = await req.json();
    console.log('URL reçue:', videoUrl);
    console.log('Type de contenu demandé:', contentType);

    if (!videoUrl) {
      console.log('Erreur: URL manquante');
      return NextResponse.json(
        { error: "URL de la vidéo requise" },
        { status: 400 }
      );
    }

    try {
      console.log('Début du téléchargement et extraction');
      // Téléchargement de la vidéo et extraction de l'audio
      const { videoPath, audioPath } = await downloadVideoAndExtractAudio(videoUrl);
      tempFiles.push(videoPath, audioPath);
      console.log('Vidéo téléchargée et audio extrait');

      console.log('Début de la transcription');
      // Transcription avec Whisper d'OpenAI
      const transcription = await transcribeAudio(audioPath);
      console.log('Transcription terminée');
      console.log('Contenu de la transcription complète:', transcription);

      console.log('Début de la génération des contenus');
      // Génération de contenu avec ChatGPT
      const results = await generateContent({
        transcription,
        contentType: contentType === 'tweets' ? 'tweets' : 'thread'
      });
      console.log('Contenus générés');
      console.log('Contenus formatés:', results);

      return NextResponse.json({ results });

    } catch (error: unknown) {
      console.error('Erreur pendant le traitement:', error);

      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Une erreur inconnue est survenue.");
      }
    }

  } catch (error: unknown) {
    console.error('Erreur générale:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Erreur lors du traitement: " + error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: "Erreur inconnue lors du traitement" },
        { status: 500 }
      );
    }
  } finally {
    // Nettoyage des fichiers temporaires dans tous les cas
    cleanupFiles(tempFiles);
    console.log('Fichiers temporaires nettoyés');
  }
}
