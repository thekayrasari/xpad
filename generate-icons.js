const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, 'frontend', 'logo.svg');

// Check if SVG exists
if (!fs.existsSync(svgPath)) {
  console.error(`Error: SVG file not found at ${svgPath}`);
  process.exit(1);
}

// Read SVG content and create a data URL
const svgContent = fs.readFileSync(svgPath, 'utf8');
const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(`
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      background: transparent;
    }
    svg {
      width: 100vw;
      height: 100vh;
      display: block;
    }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>
`)}`;

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
  // Create a 512x512 window (large enough to avoid Windows min-size constraints)
  const win = new BrowserWindow({
    width: 512,
    height: 512,
    show: false,
    useContentSize: true,
    frame: false,
    webPreferences: {
      offscreen: true,
      transparent: true
    }
  });

  await win.loadURL(dataUrl);

  // Allow rendering pipeline to catch up
  await new Promise(resolve => setTimeout(resolve, 500));

  const baseNativeImg = await win.webContents.capturePage();

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
