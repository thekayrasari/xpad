const { app, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

const pngPath = path.join(__dirname, 'frontend', 'logo.png');

// Check if PNG exists
if (!fs.existsSync(pngPath)) {
  console.error(`Error: PNG file not found at ${pngPath}`);
  process.exit(1);
}

function createIco(pngBuffers) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type (1 = ICO)
  header.writeUInt16LE(pngBuffers.length, 4); // Number of images

  const entries = [];
  let currentOffset = 6 + pngBuffers.length * 16;

  for (const img of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // Color palette size (0)
    entry.writeUInt8(0, 3); // Reserved (0)
    entry.writeUInt16LE(1, 4); // Color planes (1)
    entry.writeUInt16LE(32, 6); // Bits per pixel (32)
    entry.writeUInt32LE(img.buffer.length, 8); // Image size
    entry.writeUInt32LE(currentOffset, 12); // Image offset

    entries.push(entry);
    currentOffset += img.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map(img => img.buffer)]);
}

app.whenReady().then(async () => {
  const baseNativeImg = nativeImage.createFromPath(pngPath);

  if (baseNativeImg.isEmpty()) {
    console.error(`Error: Failed to load PNG image from ${pngPath}`);
    app.quit();
    return;
  }

  const resolutions = [16, 32, 48, 64, 128, 256, 512];
  const pngBuffers = [];

  for (const res of resolutions) {
    console.log(`Generating icon at ${res}x${res} via resizing...`);
    const resizedImg = baseNativeImg.resize({ width: res, height: res, quality: 'best' });
    const pngBuffer = resizedImg.toPNG();
    pngBuffers.push({ width: res, height: res, buffer: pngBuffer });
  }

  // 1. Save app_icon.png (used by Electron BrowserWindow at 512x512)
  const appIconPng = pngBuffers.find(p => p.width === 512).buffer;
  fs.writeFileSync(path.join(__dirname, 'app_icon.png'), appIconPng);
  console.log('Saved app_icon.png');

  // 2. Save favicon.png (used by web app)
  const faviconPng = pngBuffers.find(p => p.width === 32).buffer;
  const faviconDir = path.join(__dirname, 'frontend', 'public');
  if (!fs.existsSync(faviconDir)) {
    fs.mkdirSync(faviconDir, { recursive: true });
  }
  fs.writeFileSync(path.join(faviconDir, 'favicon.png'), faviconPng);
  console.log('Saved frontend/public/favicon.png');

  // 3. Save app_icon.ico (for Windows installer / application)
  // Include standard Windows sizes
  const winSizes = [16, 32, 48, 256];
  const icoBuffers = pngBuffers.filter(p => winSizes.includes(p.width));
  const icoData = createIco(icoBuffers);
  fs.writeFileSync(path.join(__dirname, 'app_icon.ico'), icoData);
  console.log('Saved app_icon.ico');

  console.log('Icon generation completed successfully!');
  app.quit();
});
