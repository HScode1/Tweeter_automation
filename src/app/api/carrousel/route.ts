import { NextResponse } from "next/server";
import {
  downloadVideoAndExtractAudio,
  splitAudio,
  transcribeAudio,
  extractYouTubeID,
  cleanupFiles
} from '@/lib/fileUtils';
import { generateContent } from '@/lib/contentGenerator';
import { generateImageWithText } from '@/lib/imageGenerator';

interface RequestBody {
  videoUrl: string;
  contentType?: string;
  outputLanguage?: string;
}

export async function POST(req: Request) {
  const tempFiles: string[] = [];
  
  try {
    const body: RequestBody = await req.json();
    const { videoUrl, contentType = 'carousel', outputLanguage = 'fr' } = body;
    
    if (!videoUrl) {
      return NextResponse.json({ error: "URL de la vidéo requise" }, { status: 400 });
    }
    
    // Téléchargement de la vidéo et extraction de l'audio
    const { videoPath, audioPath } = await downloadVideoAndExtractAudio(videoUrl);
    tempFiles.push(videoPath, audioPath);
    
    // Découpage de l'audio en segments
    const audioSegments = await splitAudio(audioPath, tempFiles[0].split('/').slice(0, -1).join('/'));
    tempFiles.push(...audioSegments);
    
    // Transcription des segments audio
    const transcription = await transcribeAudio(audioSegments);
    
    // Génération du contenu du carousel avec la langue spécifiée
    const results = await generateContent({
      transcription,
      contentType: 'carousel',
      outputLanguage
    });
    
    // Extraction de la vignette YouTube
    const ytID = extractYouTubeID(videoUrl);
    const thumbnail = ytID ? `https://img.youtube.com/vi/${ytID}/maxresdefault.jpg` : "";
    
    // Génération de l'image de résumé
    let summaryImage = "";
    try {
      summaryImage = await generateImageWithText({
        text: results,
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        language: outputLanguage
      });
    } catch (error) {
      console.error('Erreur lors de la génération de l\'image:', error);
    }
    
    return NextResponse.json({ results, thumbnail, summaryImage });
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: "Erreur lors du traitement: " + error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Une erreur inconnue est survenue." },
      { status: 500 }
    );
  } finally {
    // Nettoyage des fichiers temporaires dans tous les cas
    cleanupFiles(tempFiles);
  }
}