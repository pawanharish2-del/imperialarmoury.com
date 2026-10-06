/**
 * Imperial Armoury — Image Optimization Script
 * 
 * Usage: node optimize-images.mjs
 * 
 * What it does:
 * 1. Backs up original images to assets/images-original/
 * 2. Resizes oversized images to appropriate max dimensions
 * 3. Converts PNG/JPG to WebP with quality 80
 * 4. Replaces originals in assets/images/ with optimized WebP versions
 * 5. Prints a before/after size report
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const IMAGES_DIR = path.join(process.cwd(), 'assets', 'images');
const BACKUP_DIR = path.join(process.cwd(), 'assets', 'images-original');

// Max dimensions based on how images are actually used
const MAX_WIDTH_HERO = 1920;       // Hero/banner/parallax backgrounds
const MAX_WIDTH_CONTENT = 1200;    // Content images, cards, catalog
const MAX_WIDTH_SMALL = 800;       // Smaller images, thumbnails
const MAX_WIDTH_MENU = 400;        // Menu/nav images

// Images and their target max widths based on analysis of actual usage
const IMAGE_SIZE_MAP = {
  // Hero/Parallax backgrounds (displayed full-width)
  'Home-01.png': MAX_WIDTH_HERO,
  'Home-02.png': MAX_WIDTH_HERO,
  'Home-03.png': MAX_WIDTH_HERO,
  'Home-10.png': MAX_WIDTH_HERO,
  'Home-16.png': MAX_WIDTH_HERO,
  'About-us-banner-wide.png': MAX_WIDTH_HERO,
  'About-01.png': MAX_WIDTH_HERO,
  'DSR-1-SNIPER-RIFLE-Banner.webp': MAX_WIDTH_HERO,
  'LINK-SERIES-section - 1.png': MAX_WIDTH_HERO,
  'Contact-01.png': MAX_WIDTH_HERO,
  'AMMUNITION-01.png': MAX_WIDTH_HERO,
  'followus-bg.jpg': MAX_WIDTH_HERO,

  // Content images (displayed ~600-1200px)
  'Home-04.png': MAX_WIDTH_CONTENT,
  'Home-05.png': MAX_WIDTH_CONTENT,
  'Home-06.png': MAX_WIDTH_CONTENT,
  'Home-07.png': MAX_WIDTH_CONTENT,
  'Home-08.png': MAX_WIDTH_CONTENT,
  'Home-09.png': MAX_WIDTH_CONTENT,
  'Home-11.png': MAX_WIDTH_CONTENT,
  'Home-12.png': MAX_WIDTH_CONTENT,
  'Home-13.png': MAX_WIDTH_CONTENT,
  'Home-14.png': MAX_WIDTH_CONTENT,
  'Home-15.png': MAX_WIDTH_CONTENT,
  'About-02.png': MAX_WIDTH_CONTENT,
  'About-03.png': MAX_WIDTH_CONTENT,
  'About-04.png': MAX_WIDTH_CONTENT,
  'About-05.png': MAX_WIDTH_CONTENT,
  'DSR 1-01.png': MAX_WIDTH_CONTENT,
  'DSR 1-02.png': MAX_WIDTH_CONTENT,
  'DSR 1-03.png': MAX_WIDTH_CONTENT,
  'DSR 1-04.png': MAX_WIDTH_CONTENT,
  'DSR 1-05.png': MAX_WIDTH_CONTENT,
  'DSR 1-06.png': MAX_WIDTH_CONTENT,
  'DSR 1-07.png': MAX_WIDTH_CONTENT,
  'VIPER-01.png': MAX_WIDTH_CONTENT,
  'VIPER-02.png': MAX_WIDTH_CONTENT,
  'VIPER-06.png': MAX_WIDTH_CONTENT,
  'VIPER-07.png': MAX_WIDTH_CONTENT,
  'VIPER-08.png': MAX_WIDTH_CONTENT,
  'VIPER-09.png': MAX_WIDTH_CONTENT,
  'VIPER-10.png': MAX_WIDTH_CONTENT,
  'AMMUNITION-02.png': MAX_WIDTH_CONTENT,
  'AMMUNITION-03.png': MAX_WIDTH_CONTENT,
  'AMMUNITION-04.png': MAX_WIDTH_CONTENT,
  'H6-Rifle-Spotlight-Section.png': MAX_WIDTH_CONTENT,
  'IA-ammunition.png': MAX_WIDTH_CONTENT,
  'assetsimages2.png': MAX_WIDTH_CONTENT,
  'imperialgearpackimage.png': MAX_WIDTH_CONTENT,
  'imperialimages122.png': MAX_WIDTH_CONTENT,
  'imperiallinkseries2.png': MAX_WIDTH_CONTENT,
  'imperialstrenthimg.png': MAX_WIDTH_CONTENT,
  'Jodhpur Fort.png': MAX_WIDTH_CONTENT,
  'weapon-precision.png': MAX_WIDTH_CONTENT,
  'weapon-ar15-white.png': MAX_WIDTH_CONTENT,

  // Smaller images (icons, badges, small cards)
  'DSR 1-08.png': MAX_WIDTH_SMALL,
  'DSR 1-09.png': MAX_WIDTH_SMALL,
  'DSR 1-10.png': MAX_WIDTH_SMALL,
  'VIPER-03.png': MAX_WIDTH_SMALL,
  'VIPER-04.png': MAX_WIDTH_SMALL,
  'VIPER-05.png': MAX_WIDTH_SMALL,
  'rifles-left.png': MAX_WIDTH_SMALL,
  'ammunition-bullets.png': MAX_WIDTH_SMALL,
  'mountain-footer.png': MAX_WIDTH_SMALL,

  // Menu/nav images (displayed small)
  'Weapons-01.png': MAX_WIDTH_MENU,
  'Weapons-02.png': MAX_WIDTH_MENU,
  'weapon-dsr1-clean.png': MAX_WIDTH_MENU,
  'weapon-viper-menu.png': MAX_WIDTH_MENU,
};

// Files to skip (already optimized, SVG, video, etc.)
const SKIP_EXTENSIONS = ['.svg', '.mp4', '.ico'];
const SKIP_FILES = ['logo.svg'];

// Already webp files that are small — skip
const ALREADY_OPTIMIZED = [
  'Ammunition-Manufacturer.webp',
  'IA-ammunition2.webp',
  'DSR-1-SNIPER-RIFLE-Banner.webp',
  'new-Rifle-1-2048x496 (1).webp',
  'workbench-rifle.webp',
];

async function optimizeImage(filePath, fileName) {
  const ext = path.extname(fileName).toLowerCase();
  
  // Skip non-raster or already-optimized
  if (SKIP_EXTENSIONS.includes(ext) || SKIP_FILES.includes(fileName) || ALREADY_OPTIMIZED.includes(fileName)) {
    return null;
  }
  
  // Only process png, jpg, jpeg
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) {
    return null;
  }

  const originalSize = fs.statSync(filePath).size;
  const maxWidth = IMAGE_SIZE_MAP[fileName] || MAX_WIDTH_CONTENT;

  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    const originalWidth = metadata.width;
    const originalHeight = metadata.height;

    // Determine if resize is needed
    let pipeline = sharp(filePath);
    
    if (metadata.width > maxWidth) {
      pipeline = pipeline.resize(maxWidth, null, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Determine if image has alpha channel (transparency)
    const hasAlpha = metadata.channels === 4 || metadata.hasAlpha;
    
    // Convert to WebP
    const webpBuffer = await pipeline
      .webp({
        quality: 80,
        effort: 4,
        alphaQuality: 85,
      })
      .toBuffer();

    const webpName = fileName.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    const webpPath = path.join(IMAGES_DIR, webpName);
    
    fs.writeFileSync(webpPath, webpBuffer);
    
    const newSize = webpBuffer.length;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

    return {
      original: fileName,
      webp: webpName,
      originalSize,
      newSize,
      savings: parseFloat(savings),
      originalDimensions: `${originalWidth}x${originalHeight}`,
      resized: metadata.width > maxWidth,
      maxWidth,
    };
  } catch (err) {
    console.error(`  ERROR processing ${fileName}: ${err.message}`);
    return null;
  }
}

async function main() {
  console.log('=== Imperial Armoury Image Optimizer ===\n');

  // Step 1: Create backup directory
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log(`Created backup directory: ${BACKUP_DIR}`);
  }

  // Step 2: Get all image files
  const files = fs.readdirSync(IMAGES_DIR).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.png', '.jpg', '.jpeg'].includes(ext);
  });

  console.log(`Found ${files.length} raster images to process\n`);

  // Step 3: Back up originals
  console.log('Backing up originals...');
  let backedUp = 0;
  for (const file of files) {
    const src = path.join(IMAGES_DIR, file);
    const dst = path.join(BACKUP_DIR, file);
    if (!fs.existsSync(dst)) {
      fs.copyFileSync(src, dst);
      backedUp++;
    }
  }
  console.log(`  Backed up ${backedUp} new files (${files.length - backedUp} already backed up)\n`);

  // Step 4: Optimize each image
  console.log('Optimizing images...\n');
  const results = [];
  let totalOriginal = 0;
  let totalOptimized = 0;

  for (const file of files) {
    const filePath = path.join(IMAGES_DIR, file);
    process.stdout.write(`  Processing: ${file}... `);
    
    const result = await optimizeImage(filePath, file);
    if (result) {
      results.push(result);
      totalOriginal += result.originalSize;
      totalOptimized += result.newSize;
      console.log(`${formatSize(result.originalSize)} -> ${formatSize(result.newSize)} (${result.savings}% saved)${result.resized ? ` [resized to ${result.maxWidth}px]` : ''}`);
    } else {
      console.log('skipped');
    }
  }

  // Step 5: Print summary
  console.log('\n=== OPTIMIZATION SUMMARY ===\n');
  console.log(`Images processed: ${results.length}`);
  console.log(`Total original size: ${formatSize(totalOriginal)}`);
  console.log(`Total optimized size: ${formatSize(totalOptimized)}`);
  console.log(`Total savings: ${formatSize(totalOriginal - totalOptimized)} (${((totalOriginal - totalOptimized) / totalOriginal * 100).toFixed(1)}%)`);
  
  console.log('\nTop 10 biggest savings:');
  results
    .sort((a, b) => (b.originalSize - b.newSize) - (a.originalSize - a.newSize))
    .slice(0, 10)
    .forEach(r => {
      console.log(`  ${r.original}: ${formatSize(r.originalSize)} -> ${formatSize(r.newSize)} (${r.savings}% saved)`);
    });

  // Step 6: Write manifest
  const manifest = {
    timestamp: new Date().toISOString(),
    totalImages: results.length,
    totalOriginalBytes: totalOriginal,
    totalOptimizedBytes: totalOptimized,
    savingsPercent: ((totalOriginal - totalOptimized) / totalOriginal * 100).toFixed(1),
    files: results.map(r => ({
      original: r.original,
      webp: r.webp,
      originalSize: r.originalSize,
      optimizedSize: r.newSize,
      savingsPercent: r.savings,
      originalDimensions: r.originalDimensions,
      resized: r.resized,
    })),
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'image-optimization-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('\nManifest written to image-optimization-manifest.json');
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

main().catch(console.error);
