import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imgDir = path.join(__dirname, 'public', 'images');

// Each entry: [subdir, filename, bgType] relative to imgDir
// bgType: 'white' for white backgrounds, 'gray' for gray/neutral backgrounds
const filesToProcess = [
  ['horcruxes', 'copa.png', 'white'],
  ['horcruxes', 'nagini.png', 'white'],
  ['horcruxes', 'anillo.png', 'white'],
  ['horcruxes', 'guardapelo.png', 'white'],
  ['horcruxes', 'diario.png', 'white'],
  ['horcruxes', 'diadema.png', 'white'],
  ['horcruxes', 'harry.png', 'white'],
  ['carmena', 'ignacio.png', 'white'],
  ['slytherin', 'ignacio.png', 'white'],
  ['marinero', 'ignacio.png', 'gray'],
];

async function removeWhiteBg(subdir, filename) {
  const filePath = path.join(imgDir, subdir, filename);
  const outputPath = filePath;
  
  const image = sharp(filePath);
  
  // Get raw pixel data
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const w = info.width;
  const h = info.height;
  const threshold = 235; // pixels with R,G,B all above this are "white"
  const edgeSmooth = 210; // partial transparency zone for smooth edges

  // Helper to check if a pixel is white-ish (background candidate)
  const isWhitish = (idx) => {
    return data[idx] > edgeSmooth && data[idx + 1] > edgeSmooth && data[idx + 2] > edgeSmooth;
  };

  // Flood-fill from edges: only mark background-connected white pixels
  const visited = new Uint8Array(w * h); // 0=unvisited, 1=background
  const queue = [];

  // Seed from all edge pixels that are white-ish
  for (let x = 0; x < w; x++) {
    for (const y of [0, h - 1]) {
      const px = y * w + x;
      if (isWhitish(px * 4)) { queue.push(px); visited[px] = 1; }
    }
  }
  for (let y = 0; y < h; y++) {
    for (const x of [0, w - 1]) {
      const px = y * w + x;
      if (!visited[px] && isWhitish(px * 4)) { queue.push(px); visited[px] = 1; }
    }
  }

  // BFS flood fill
  while (queue.length > 0) {
    const px = queue.shift();
    const x = px % w;
    const y = (px - x) / w;
    const neighbors = [];
    if (x > 0) neighbors.push(px - 1);
    if (x < w - 1) neighbors.push(px + 1);
    if (y > 0) neighbors.push(px - w);
    if (y < h - 1) neighbors.push(px + w);
    for (const n of neighbors) {
      if (!visited[n] && isWhitish(n * 4)) {
        visited[n] = 1;
        queue.push(n);
      }
    }
  }

  // Apply transparency only to background-connected pixels
  for (let px = 0; px < w * h; px++) {
    if (!visited[px]) continue;
    const i = px * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (r > threshold && g > threshold && b > threshold) {
      // Fully transparent
      data[i + 3] = 0;
    } else {
      // Partial transparency for smooth edges
      const avgBrightness = (r + g + b) / 3;
      const alpha = Math.round(255 * (1 - (avgBrightness - edgeSmooth) / (threshold - edgeSmooth)));
      data[i + 3] = Math.max(0, Math.min(data[i + 3], alpha));
    }
  }
  
  await sharp(data, {
    raw: {
      width: w,
      height: h,
      channels: 4,
    },
  })
    .png({ quality: 90 })
    .toFile(outputPath + '.tmp');
  
  // Replace original
  const fs = await import('fs');
  fs.renameSync(outputPath + '.tmp', outputPath);
  
  console.log(`✅ Processed: ${subdir}/${filename} (${w}x${h})`);
}

async function removeGrayBg(subdir, filename) {
  const filePath = path.join(imgDir, subdir, filename);
  const outputPath = filePath;
  
  const image = sharp(filePath);
  
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const w = info.width;
  const h = info.height;

  // Auto-detect background color by sampling corner regions (10x10 px)
  const sampleSize = Math.min(10, Math.floor(w / 4), Math.floor(h / 4));
  let totalR = 0, totalG = 0, totalB = 0, count = 0;
  for (const [cx, cy] of [[0, 0], [w - sampleSize, 0], [0, h - sampleSize], [w - sampleSize, h - sampleSize]]) {
    for (let dy = 0; dy < sampleSize; dy++) {
      for (let dx = 0; dx < sampleSize; dx++) {
        const i = ((cy + dy) * w + (cx + dx)) * 4;
        totalR += data[i]; totalG += data[i + 1]; totalB += data[i + 2];
        count++;
      }
    }
  }
  const bgR = Math.round(totalR / count);
  const bgG = Math.round(totalG / count);
  const bgB = Math.round(totalB / count);
  console.log(`   Background color detected: rgb(${bgR}, ${bgG}, ${bgB})`);

  const fullTranspDist = 100;
  const floodDist = 130;
  const maxSaturation = 20;

  const colorDist = (idx) => {
    const dr = data[idx] - bgR;
    const dg = data[idx + 1] - bgG;
    const db = data[idx + 2] - bgB;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  const pixelSat = (idx) => {
    return Math.max(data[idx], data[idx + 1], data[idx + 2]) - Math.min(data[idx], data[idx + 1], data[idx + 2]);
  };

  const isBgLike = (idx) => colorDist(idx) < floodDist && pixelSat(idx) < maxSaturation;

  const visited = new Uint8Array(w * h);
  const queue = [];

  for (let x = 0; x < w; x++) {
    for (const y of [0, h - 1]) {
      const px = y * w + x;
      if (isBgLike(px * 4)) { queue.push(px); visited[px] = 1; }
    }
  }
  for (let y = 0; y < h; y++) {
    for (const x of [0, w - 1]) {
      const px = y * w + x;
      if (!visited[px] && isBgLike(px * 4)) { queue.push(px); visited[px] = 1; }
    }
  }

  while (queue.length > 0) {
    const px = queue.shift();
    const x = px % w;
    const y = (px - x) / w;
    if (x > 0 && !visited[px - 1] && isBgLike((px - 1) * 4)) { visited[px - 1] = 1; queue.push(px - 1); }
    if (x < w - 1 && !visited[px + 1] && isBgLike((px + 1) * 4)) { visited[px + 1] = 1; queue.push(px + 1); }
    if (y > 0 && !visited[px - w] && isBgLike((px - w) * 4)) { visited[px - w] = 1; queue.push(px - w); }
    if (y < h - 1 && !visited[px + w] && isBgLike((px + w) * 4)) { visited[px + w] = 1; queue.push(px + w); }
  }

  for (let px = 0; px < w * h; px++) {
    if (!visited[px]) continue;
    const i = px * 4;
    const dist = colorDist(i);

    if (dist <= fullTranspDist) {
      data[i + 3] = 0;
    } else {
      const alpha = Math.round(255 * ((dist - fullTranspDist) / (floodDist - fullTranspDist)));
      data[i + 3] = Math.max(0, Math.min(data[i + 3], alpha));
    }
  }
  
  await sharp(data, {
    raw: { width: w, height: h, channels: 4 },
  })
    .png({ quality: 90 })
    .toFile(outputPath + '.tmp');
  
  const fs = await import('fs');
  fs.renameSync(outputPath + '.tmp', outputPath);
  
  console.log(`✅ Processed: ${subdir}/${filename} (${w}x${h})`);
}

async function main() {
  console.log('🎨 Removing backgrounds from images...\n');
  for (const [subdir, file, bgType] of filesToProcess) {
    try {
      if (bgType === 'gray') {
        await removeGrayBg(subdir, file);
      } else {
        await removeWhiteBg(subdir, file);
      }
    } catch (err) {
      console.error(`❌ Error processing ${subdir}/${file}:`, err.message);
    }
  }
  console.log('\n✨ Done!');
}

main();
