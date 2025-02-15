'use server';

import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { createReadStream } from "fs";
import { generateImageWithText } from '@/lib/imageGenerator';

const execAsync = promisify(exec);
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB en octets

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RequestBody {
  videoUrl: string;
}

function extractYouTubeID(url: string): string | null {
  const regex = /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

async function splitAudio(inputPath: string, outputDir: string, segmentDuration: number = 300): Promise<string[]> {
  const segments: string[] = [];
  const baseFileName = path.basename(inputPath, '.mp3');

  const { stdout: durationStr } = await execAsync(
    `ffprobe -i "${inputPath}" -show_entries format=duration -v quiet -of csv="p=0"`
  );
  const duration = parseFloat(durationStr);
  const segmentCount = Math.ceil(duration / segmentDuration);

  for (let i = 0; i < segmentCount; i++) {
    const start = i * segmentDuration;
    const outputPath = path.join(outputDir, `${baseFileName}_part${i}.mp3`);

    await execAsync(
      `ffmpeg -i "${inputPath}" -ss ${start} -t ${segmentDuration} -c copy "${outputPath}"`
    );

    const stats = fs.statSync(outputPath);
    if (stats.size > MAX_FILE_SIZE) {
      throw new Error(`Segment size ${stats.size} exceeds maximum allowed size of ${MAX_FILE_SIZE}`);
    }

    segments.push(outputPath);
  }

  return segments;
}

async function transcribeAudio(segments: string[]): Promise<string> {
  let fullTranscription = '';

  for (const segment of segments) {
    const audioStream = createReadStream(segment);
    const transcription = await openai.audio.transcriptions.create({
      file: audioStream,
      model: "whisper-1",
      language: "fr",
    });

    if (transcription.text) {
      fullTranscription += transcription.text + ' ';
    }
  }

  return fullTranscription.trim();
}

export async function POST(req: Request) {
  const tempFiles: string[] = [];

  try {
    const body: RequestBody = await req.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return NextResponse.json({ error: "URL de la vidéo requise" }, { status: 400 });
    }

    const tempDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    const videoId = Date.now().toString();
    const videoPath = path.join(tempDir, `${videoId}.mp4`);
    const audioPath = path.join(tempDir, `${videoId}.mp3`);

    tempFiles.push(videoPath, audioPath);

    await execAsync(`yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4" "${videoUrl}" -o "${videoPath}"`);
    await execAsync(`ffmpeg -i "${videoPath}" -q:a 0 -map a "${audioPath}"`);

    const audioSegments = await splitAudio(audioPath, tempDir);
    tempFiles.push(...audioSegments);

    const transcription = await transcribeAudio(audioSegments);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en synthèse et vulgarisation. Ta tâche est d'extraire les idées principales d'une vidéo et de les présenter de manière claire et concise.",
        },
        {
          role: "user",
          content: `Voici la transcription de la vidéo:\n\n${transcription}\n\nCrée un résumé des points clés de cette vidéo. Format souhaité :\n1. Un titre accrocheur\n2. 3-5 idées principales (une ligne par idée)\n3. Une conclusion/takeaway\n\nChaque point doit être clair et concis.`,
        },
      ],
      temperature: 0.7,
    });

    const carouselText = completion.choices[0]?.message?.content ?? "";
    const results = carouselText.split("\n").filter(line => line.trim().length > 0);

    const ytID = extractYouTubeID(videoUrl);
    const thumbnail = ytID ? `https://img.youtube.com/vi/${ytID}/maxresdefault.jpg` : "";

    let summaryImage = "";
    try {
      summaryImage = await generateImageWithText({
        text: results,
        width: 1200,
        height: 1500,
        backgroundColor: '#FFFFFF',
        textColor: '#000000',
        fontSize: 32,
        padding: 60
      });
    } catch (error) {
      console.error('Erreur lors de la génération de l’image:', error);
    }

    tempFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });

    return NextResponse.json({ results, thumbnail, summaryImage });

  } catch (error: unknown) {
    tempFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });

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
  }
}
