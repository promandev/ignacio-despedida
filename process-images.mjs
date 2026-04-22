import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imgDir = path.join(__dirname, 'public', 'images');

// Each entry: [subdir, filename] relative to imgDir
const filesToProcess = [
  ['horcruxes', 'copa.png'],
  ['horcruxes', 'nagini.png'],
  ['horcruxes', 'anillo.png'],
  ['horcruxes', 'guardapelo.png'],
  ['horcruxes', 'diario.png'],
  ['horcruxes', 'diadema.png'],
  ['horcruxes', 'harry.png'],
  ['carmena', 'ignacio.png'],
  ['slytherin', 'ignacio.png'],
  ['marinero', 'ignacio.png'],
];

async function removeWhiteBg(subdir, filename) {
  const filePath = path.join(imgDir, subdir, filename);
  const outputPath = filePath;
  
  const image = sharp(filePath);
  const { width, height } = await image.metadata();
  
  // Get raw pixel data
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const threshold = 235; // pixels with R,G,B all above this become transparent
  const edgeSmooth = 210; // partial transparency zone
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    if (r > threshold && g > threshold && b > threshold) {
      // Fully transparent
      data[i + 3] = 0;
    } else if (r > edgeSmooth && g > edgeSmooth && b > edgeSmooth) {
      // Partial transparency for smooth edges
      const avgBrightness = (r + g + b) / 3;
      const alpha = Math.round(255 * (1 - (avgBrightness - edgeSmooth) / (255 - edgeSmooth)));
      data[i + 3] = Math.min(data[i + 3], alpha);
    }
  }
  
  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png({ quality: 90 })
    .toFile(outputPath + '.tmp');
  
  // Replace original
  const fs = await import('fs');
  fs.renameSync(outputPath + '.tmp', outputPath);
  
  console.log(`✅ Processed: ${subdir}/${filename} (${info.width}x${info.height})`);
}

async function main() {
  console.log('🎨 Removing white backgrounds from images...\n');
  for (const [subdir, file] of filesToProcess) {
    try {
      await removeWhiteBg(subdir, file);
    } catch (err) {
      console.error(`❌ Error processing ${subdir}/${file}:`, err.message);
    }
  }
  console.log('\n✨ Done!');
}

main();
