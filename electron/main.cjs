const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow = null;
let pythonWorker = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1720,
    height: 1020,
    minWidth: 1280,
    minHeight: 760,
    backgroundColor: '#09090B',
    titleBarStyle: 'hiddenInset',
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
  if (!app.isPackaged) {
    mainWindow.loadURL(devUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startPythonBackend() {
  try {
    pythonWorker = spawn('python', ['-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', '--port', '8000'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
    });

    pythonWorker.stdout.on('data', (data) => {
      console.log(`[FastAPI Worker]: ${data.toString().trim()}`);
    });

    pythonWorker.stderr.on('data', (data) => {
      console.error(`[FastAPI Worker]: ${data.toString().trim()}`);
    });
  } catch (err) {
    console.warn('FastAPI worker auto-launch skipped or handled externally:', err.message);
  }
}

ipcMain.handle('tmg:select-media-file', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Import Media Asset to TMG Auto Studio',
    properties: ['openFile'],
    filters: [
      { name: 'Broadcast Media', extensions: ['mp4', 'mov', 'mkv', 'wav', 'mp3', 'aac', 'webm'] },
    ],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle('tmg:get-hardware-info', async () => {
  return {
    platform: process.platform,
    arch: process.arch,
    gpuEncoder: process.platform === 'darwin' ? 'h264_videotoolbox' : 'h264_nvenc',
    hevcEncoder: process.platform === 'darwin' ? 'hevc_videotoolbox' : 'hevc_nvenc',
    webCodecsSupported: true,
    vramTotalMB: 16384,
    vramUsedMB: 2420,
  };
});

app.whenReady().then(() => {
  startPythonBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (pythonWorker) {
    pythonWorker.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

