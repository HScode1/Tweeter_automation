import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createReadStream } from 'fs';
import { openai } from './openai';

export const execAsync = promisify(exec);
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB en octets

/**
 * Crée un dossier temporaire s'il n'existe pas déjà
 * @returns Le chemin vers le dossier temporaire
 */
export function ensureTempDir(): string {
  const tempDir = path.join(process.cwd(), 'tmp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  return tempDir;
}

/**
 * Supprime les fichiers temporaires
 * @param files Liste des chemins de fichiers à supprimer
 */
export function cleanupFiles(files: string[]): void {
  files.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }
  });
}

/**
 * Extrait l'ID d'une vidéo YouTube à partir de son URL
 * @param url URL de la vidéo YouTube
 * @returns ID de la vidéo YouTube ou null si non trouvé
 */
export function extractYouTubeID(url: string): string | null {
  const regex = /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Télécharge une vidéo YouTube et extrait son audio
 * @param videoUrl URL de la vidéo YouTube
 * @returns Objet contenant les chemins des fichiers vidéo et audio
 */
export async function downloadVideoAndExtractAudio(videoUrl: string): Promise<{
  videoPath: string;
  audioPath: string;
  videoId: string;
}> {
  const tempDir = ensureTempDir();
  const videoId = Date.now().toString();
  const videoPath = path.join(tempDir, `${videoId}.mp4`);
  const audioPath = path.join(tempDir, `${videoId}.mp3`);

  // Téléchargement de la vidéo avec yt-dlp
  await execAsync(`yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4" "${videoUrl}" -o "${videoPath}"`);
  
  // Extraction de l'audio avec FFmpeg
  await execAsync(`ffmpeg -i "${videoPath}" -q:a 0 -map a "${audioPath}"`);

  return { videoPath, audioPath, videoId };
}

/**
 * Divise un fichier audio en segments plus petits
 * @param inputPath Chemin du fichier audio d'entrée
 * @param outputDir Dossier de sortie pour les segments
 * @param segmentDuration Durée de chaque segment en secondes (défaut: 300s)
 * @returns Liste des chemins des segments audio
 */
export async function splitAudio(
  inputPath: string, 
  outputDir: string, 
  segmentDuration: number = 300
): Promise<string[]> {
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

/**
 * Transcrit un ou plusieurs segments audio en texte
 * @param segments Liste des chemins des segments audio ou chemin d'un seul fichier audio
 * @returns Transcription complète
 */
export async function transcribeAudio(segments: string[] | string): Promise<string> {
  // Si un seul fichier est passé, le convertir en tableau
  const segmentArray = Array.isArray(segments) ? segments : [segments];
  let fullTranscription = '';

  for (const segment of segmentArray) {
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
