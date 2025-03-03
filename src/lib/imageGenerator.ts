import { createCanvas } from 'canvas';

interface GenerateImageOptions {
  width: number;
  height: number;
  text: string[];
  backgroundColor?: string;
  textColor?: string;
  language?: string;
}

// Titres traduits pour chaque langue
const titleTranslations: Record<string, string> = {
  fr: "Résumé de la vidéo",
  en: "Video Summary",
  es: "Resumen del video",
  de: "Video-Zusammenfassung",
  it: "Riassunto del video",
  pt: "Resumo do vídeo"
};

export async function generateImageWithText({
  width = 1200,
  height = 1500,
  text,
  backgroundColor = '#FFFFFF',
  textColor = '#000000',
  language = 'fr'
}: GenerateImageOptions): Promise<string> {
  // Dimensions optimisées
  width = 1800;
  height = 2400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fond
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  // Tailles considérablement réduites
  const padding = 100;
  const titleFontSize = 100; // Réduit encore
  const contentFontSize = 60; // Réduit significativement
  
  // Ligne de séparation sous le titre
  const lineY = padding + titleFontSize + 30;
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(padding, lineY);
  ctx.lineTo(width - padding, lineY);
  ctx.stroke();
  
  // Titre
  ctx.fillStyle = textColor;
  ctx.font = `bold ${titleFontSize}px Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  const title = titleTranslations[language] || titleTranslations.fr;
  ctx.fillText(title, padding, padding);
  
  // Contenu
  let y = lineY + 80;
  const lineHeight = contentFontSize * 1.3; // Espacement réduit entre lignes
  const pointSpacing = contentFontSize * 1.8; // Espacement réduit entre points
  
  text.forEach((point, index) => {
    // Points numérotés
    const pointNum = `${index + 1}. `;
    ctx.font = `bold ${contentFontSize}px Arial, sans-serif`;
    const numWidth = ctx.measureText(pointNum).width;
    ctx.fillText(pointNum, padding, y);
    
    // Texte du point
    ctx.font = `${contentFontSize}px Arial, sans-serif`;
    
    const words = point.split(' ');
    let line = '';
    const maxWidth = width - (padding * 2) - numWidth;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && line !== '') {
        ctx.fillText(line, padding + numWidth, y);
        line = word + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, padding + numWidth, y);
    y += pointSpacing; // Espace réduit entre les points
  });
  
  return canvas.toDataURL('image/png', 1.0);
}