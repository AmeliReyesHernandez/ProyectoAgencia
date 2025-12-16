const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const waitPort = require('wait-port');

let backendProcess;
let mainWindow;
const isDev = !app.isPackaged;

function startBackend() {
  console.log('[Electron] Iniciando backend...');
  
  const backendPath = path.join(__dirname, 'backend', 'server.js');
  const backendDir = path.join(__dirname, 'backend');
  
  backendProcess = spawn('node', [path.basename(backendPath)], {
    cwd: backendDir,
    env: {
      ...process.env,
      PORT: '4000',
      DB_HOST: 'localhost',
      CORS_ORIGIN: 'http://localhost:5173,http://localhost:3000'
    },
    stdio: 'inherit'
  });

  backendProcess.on('error', (err) => {
    console.error('[Electron] Error iniciando backend:', err);
  });
}

async function createWindow() {
  console.log('[Electron] Creando ventana...');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Esperar a que el backend esté listo
  console.log('[Electron] Esperando que backend esté disponible...');
  const portOpen = await waitPort({ 
    host: 'localhost', 
    port: 4000,
    timeout: 30000
  });

  if (portOpen) {
    console.log('[Electron] Backend disponible, cargando aplicación...');
    if (isDev) {
      mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
    } else {
      mainWindow.loadFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
    }
  } else {
    console.error('[Electron] Backend no respondió');
    mainWindow.loadFile(path.join(__dirname, 'offline.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.handle('app-version', () => {
  return { version: app.getVersion() };
});

app.on('ready', async () => {
  startBackend();
  setTimeout(() => {
    createWindow();
  }, 5000); // Aumentar de 3000 a 5000 para dar más tiempo al backend
    createMenu();
  }, 1000);
});

app.on('window-all-closed', () => {
  console.log('[Electron] Cerrando aplicación...');
  
  if (backendProcess) {
    console.log('[Electron] Terminando backend...');
    backendProcess.kill();
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null && app.isReady()) {
    createWindow();
  }
});

function createMenu() {
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Salir',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        ...(isDev ? [{ role: 'toggleDevTools' }] : []),
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
