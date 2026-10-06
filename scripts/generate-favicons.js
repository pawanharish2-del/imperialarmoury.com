const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

async function createFavicons() {
  const headerLogoPath = path.join(rootDir, 'assets', 'images', 'headerlogo.webp');
  
  // Extract the eagle cleanly with padding
  const eagleBuffer = await sharp(headerLogoPath)
    .extract({ left: 0, top: 3, width: 244, height: 131 })
    .png()
    .toBuffer();

  // Save base eagle logo
  fs.writeFileSync(path.join(rootDir, 'assets', 'images', 'eagle-logo.png'), eagleBuffer);

  // 512x512 base with eagle scaled to fit nicely inside
  const eagleResized512 = await sharp(eagleBuffer)
    .resize(480, 258, { fit: 'inside' })
    .toBuffer();

  const icon512Path = path.join(rootDir, 'assets', 'images', 'favicon-512x512.png');
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{ input: eagleResized512, gravity: 'centre' }])
  .png()
  .toFile(icon512Path);

  // 192x192
  await sharp(icon512Path)
    .resize(192, 192)
    .png()
    .toFile(path.join(rootDir, 'assets', 'images', 'favicon-192x192.png'));

  // Apple Touch Icon 180x180 (with white background for high clarity on iOS)
  const eagleResized180 = await sharp(eagleBuffer)
    .resize(150, 81, { fit: 'inside' })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([{ input: eagleResized180, gravity: 'centre' }])
  .png()
  .toFile(path.join(rootDir, 'assets', 'images', 'apple-touch-icon.png'));

  // 32x32
  await sharp(icon512Path)
    .resize(32, 32)
    .png()
    .toFile(path.join(rootDir, 'assets', 'images', 'favicon-32x32.png'));

  // 16x16
  await sharp(icon512Path)
    .resize(16, 16)
    .png()
    .toFile(path.join(rootDir, 'assets', 'images', 'favicon-16x16.png'));

  // Standard favicon.png
  await sharp(icon512Path)
    .resize(48, 48)
    .png()
    .toFile(path.join(rootDir, 'assets', 'images', 'favicon.png'));

  // Root favicon.png
  await sharp(icon512Path)
    .resize(32, 32)
    .png()
    .toFile(path.join(rootDir, 'favicon.png'));

  // Multi-image ICO builder
  const b16 = await sharp(icon512Path).resize(16, 16).png().toBuffer();
  const b32 = await sharp(icon512Path).resize(32, 32).png().toBuffer();
  const b48 = await sharp(icon512Path).resize(48, 48).png().toBuffer();

  function buildIco(images) {
    const count = images.length;
    const headerSize = 6;
    const dirEntrySize = 16;
    let offset = headerSize + count * dirEntrySize;
    
    const header = Buffer.alloc(headerSize);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(count, 4);

    const entries = [];
    for (const img of images) {
      const entry = Buffer.alloc(dirEntrySize);
      entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
      entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
      entry.writeUInt8(0, 2);
      entry.writeUInt8(0, 3);
      entry.writeUInt16LE(1, 4);
      entry.writeUInt16LE(32, 6);
      entry.writeUInt32LE(img.data.length, 8);
      entry.writeUInt32LE(offset, 12);
      offset += img.data.length;
      entries.push(entry);
    }

    return Buffer.concat([header, ...entries, ...images.map(i => i.data)]);
  }

  const icoBuffer = buildIco([
    { width: 16, height: 16, data: b16 },
    { width: 32, height: 32, data: b32 },
    { width: 48, height: 48, data: b48 }
  ]);

  fs.writeFileSync(path.join(rootDir, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(rootDir, 'assets', 'images', 'favicon.ico'), icoBuffer);

  console.log('Favicons generated successfully.');
}

createFavicons().catch(console.error);
