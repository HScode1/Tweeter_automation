'use server';

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { createReadStream } from 'fs';

const execAsync = promisify(exec);

// Initialisation de l'API OpenAI
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

    // Création du dossier temporaire s'il n'existe pas
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    console.log('Dossier temporaire créé:', tempDir);

    // Définition des chemins des fichiers
    const videoId = Date.now().toString();
    const videoPath = path.join(tempDir, `${videoId}.mp4`);
    const audioPath = path.join(tempDir, `${videoId}.mp3`);

    try {
      console.log('Début du téléchargement de la vidéo');
      // Téléchargement de la vidéo avec yt-dlp
      await execAsync(`yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4" "${videoUrl}" -o "${videoPath}"`);
      console.log('Vidéo téléchargée');

      console.log('Début de l\'extraction audio');
      // Extraction de l'audio avec FFmpeg
      await execAsync(`ffmpeg -i "${videoPath}" -q:a 0 -map a "${audioPath}"`);
      console.log('Audio extrait');

      console.log('Début de la transcription');
      // Transcription avec Whisper d'OpenAI
      const audioStream = createReadStream(audioPath);
      const transcription = await openai.audio.transcriptions.create({
        file: audioStream,
        model: "whisper-1",
        language: "fr",
      });
      console.log('Transcription terminée');
      console.log('Contenu de la transcription complète:', transcription.text);

      console.log('Début de la génération des contenus');
      // Génération de contenu avec ChatGPT
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

      // Suppression des fichiers temporaires
      fs.unlinkSync(videoPath);
      fs.unlinkSync(audioPath);
      console.log('Fichiers temporaires nettoyés');

      return NextResponse.json({ results });

    } catch (error: unknown) {
      console.error('Erreur pendant le traitement:', error);

      // Suppression des fichiers temporaires en cas d'erreur
      [videoPath, audioPath].forEach(file => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });

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
  }
}
