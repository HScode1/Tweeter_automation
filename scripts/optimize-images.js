const path = require('path');
const fs = require('fs');

// Create the output directory if it doesn't exist
const outputDir = path.resolve(__dirname, '../public/optimized');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

(async () => {
  console.log('Starting image optimization...');
  
  try {
    // Dynamic imports for ES modules
    const imagemin = await import('imagemin');
    const imageminWebp = await import('imagemin-webp');
    
    const files = await imagemin.default(['public/**/*.{jpg,png}'], {
      destination: outputDir,
      plugins: [
        imageminWebp.default({ quality: 75 })
      ]
    });
    
    console.log(`Optimized ${files.length} images to WebP format`);
    files.forEach(file => {
      console.log(`- ${path.relative(process.cwd(), file.destinationPath)}`);
    });
  } catch (error) {
    console.error('Error optimizing images:', error);
    process.exit(1);
  }
})();
