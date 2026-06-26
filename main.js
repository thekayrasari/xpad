const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// 1. Backend will be booted when app is ready to prevent crashing before UI is up
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    icon: path.join(__dirname, 'app_icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true
    },
    backgroundColor: '#0f172a' // Matches dark mode primary bg
  });

  Menu.setApplicationMenu(null);

  // Retry loading the backend URL in case Express hasn't finished binding yet.
  // ERR_CONNECTION_REFUSED (-102) and ERR_FAILED (-6) indicate the port isn't ready.
  const BACKEND_URL = 'http://localhost:3001';
  const MAX_RETRIES = 15;
  let retryCount = 0;

  const tryLoad = () => {
    mainWindow.loadURL(BACKEND_URL).catch(() => {
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        setTimeout(tryLoad, 500);
      }
    });
  };

  tryLoad();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {

  try {
    require('./backend/dist/main.js');
  } catch (err) {
    console.error('Failed to start backend:', err);
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  // Emit SIGTERM so the backend can gracefully shut down
  process.emit('SIGTERM');
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
