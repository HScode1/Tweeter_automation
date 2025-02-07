import { createCanvas, loadImage } from 'canvas';

interface GenerateImageOptions {
  width: number;
  height: number;
  text: string[];
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  padding?: number;
}

export async function generateImageWithText({
  width = 1200,
  height = 1500,
  text,
  backgroundColor = '#FFFFFF',
  textColor = '#000000',
  fontSize = 32,
  padding = 60
}: GenerateImageOptions): Promise<string> {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Text configuration
  ctx.fillStyle = textColor;
  ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  // Draw title
  ctx.font = `bold ${fontSize * 1.2}px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillText("Résumé de la vidéo", padding, padding);

  // Reset font for content
  ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;

  // Draw each point
  let y = padding + fontSize * 2;
  text.forEach((point, index) => {
    // Text wrapping function
    const words = point.split(' ');
    let line = `${index + 1}. `;
    const maxWidth = width - (padding * 2);
    const lineHeight = fontSize * 1.5;

    for (const word of words) {
      const testLine = line + word + ' ';
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && line !== `${index + 1}. `) {
        ctx.fillText(line, padding, y);
        line = word + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, padding, y);
    y += lineHeight * 1.5; // Add extra space between points
  });

  return canvas.toDataURL('image/png');
}
