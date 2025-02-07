'use server'
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { createReadStream } from 'fs';

const execAsync = promisify(exec);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
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

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    console.log('Dossier temporaire créé:', tempDir);

    // Define file paths
    const videoId = Date.now().toString();
    const videoPath = path.join(tempDir, `${videoId}.mp4`);
    const audioPath = path.join(tempDir, `${videoId}.mp3`);

    try {
      console.log('Début du téléchargement de la vidéo');
      // 1. Download video using yt-dlp
      await execAsync(`yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4" "${videoUrl}" -o "${videoPath}"`);
      console.log('Vidéo téléchargée');

      console.log('Début de l\'extraction audio');
      // 2. Extract audio using FFmpeg
      await execAsync(`ffmpeg -i "${videoPath}" -q:a 0 -map a "${audioPath}"`);
      console.log('Audio extrait');

      console.log('Début de la transcription');
      // 3. Transcribe with OpenAI's Whisper API
      const audioStream = createReadStream(audioPath);
      const transcription = await openai.audio.transcriptions.create({
        file: audioStream,
        model: "whisper-1",
        language: "fr",
      });
      console.log('Transcription terminée');
      console.log('Contenu de la transcription complète:', transcription.text);

      console.log('Début de la génération des contenus');
      // 4. Generate content with ChatGPT
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: contentType === "tweets"
              ? "Tu es un expert en marketing digital. Ta tâche est de générer 3 tweets accrocheurs et viraux à partir d'une transcription vidéo."
              : "Tu es un expert en marketing digital. Ta tâche est de générer un thread Twitter accrocheur et viral à partir d'une transcription vidéo. Le thread doit contenir entre 3 et 5 tweets."
          },
          {
            role: "user",
            content: `Voici la transcription d'une vidéo:\n\n${transcription.text}\n\n${
              contentType === "tweets"
                ? "Génère 3 tweets accrocheurs et viraux qui résument les points clés. Chaque tweet doit faire moins de 280 caractères. Format: un tweet par ligne."
                : "Génère un thread Twitter accrocheur et viral qui résume les points clés. Le thread doit contenir entre 3 et 5 tweets. Format: un tweet par ligne."
            }`
          }
        ],
        temperature: 0.7,
      });
      console.log('Contenus générés');
      console.log('Réponse brute de ChatGPT:', completion.choices[0].message.content);

      const results = completion.choices[0].message.content
        ?.split('\n')
        .filter(line => line.length > 0);

      console.log('Contenus formatés:', results);

      // Clean up temporary files
      fs.unlinkSync(videoPath);
      fs.unlinkSync(audioPath);
      console.log('Fichiers temporaires nettoyés');

      return NextResponse.json({ results });

    } catch (error: any) {
      console.error('Erreur pendant le traitement:', error);
      // Clean up any remaining files
      [videoPath, audioPath].forEach(file => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });
      throw error;
    }

  } catch (error: any) {
    console.error('Erreur générale:', error);
    return NextResponse.json(
      { error: "Erreur lors du traitement: " + error.message },
      { status: 500 }
    );
  }
}
