const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow = null;
let tray = null;
let gatewayProcess = null;
const GATEWAY_PORT = process.env.OPENCLAW_PORT || 18789;
const GATEWAY_URL = `http://127.0.0.1:${GATEWAY_PORT}`;

// Check if gateway is already running
function checkGatewayRunning() {
  return new Promise((resolve) => {
    const req = http.get(`${GATEWAY_URL}/health`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

// Start the gateway server
async function startGateway() {
  const isRunning = await checkGatewayRunning();
  if (isRunning) {
    console.log('Gateway already running, connecting to existing instance...');
    return;
  }

  const nodePath = process.execPath.replace('electron', 'node');
  const gatewayScript = path.join(__dirname, 'dist', 'index.js');
  
  gatewayProcess = spawn(nodePath, [gatewayScript], {
    env: {
      ...process.env,
      OPENCLAW_PORT: GATEWAY_PORT,
      NODE_ENV: 'production'
    },
    stdio: 'inherit'
  });

  gatewayProcess.on('error', (err) => {
    console.error('Failed to start gateway:', err);
  });

  gatewayProcess.on('exit', (code) => {
    console.log(`Gateway process exited with code ${code}`);
    gatewayProcess = null;
  });

  // Wait for gateway to be ready
  for (let i = 0; i < 30; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (await checkGatewayRunning()) {
      console.log('Gateway is ready!');
      return;
    }
  }
  console.warn('Gateway may not be ready yet, but continuing...');
}

// Create the main window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'assets', 'icons', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    title: 'OpenClaw',
    show: false
  });

  // Load the Control UI
  mainWindow.loadURL(GATEWAY_URL);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Create system tray
function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icons', 'icon.png');
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show OpenClaw',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        } else {
          createWindow();
        }
      }
    },
    {
      label: 'Gateway Status',
      click: async () => {
        const running = await checkGatewayRunning();
        const { dialog } = require('electron');
        dialog.showMessageBox({
          type: 'info',
          title: 'Gateway Status',
          message: running ? 'Gateway is running' : 'Gateway is not running',
          buttons: ['OK']
        });
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('OpenClaw');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    } else {
      createWindow();
    }
  });
}

// App lifecycle
app.whenReady().then(async () => {
  await startGateway();
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, keep app running in tray
  if (process.platform !== 'darwin') {
    // Don't quit, keep running in tray
  }
});

app.on('before-quit', () => {
  // Stop the gateway process
  if (gatewayProcess) {
    gatewayProcess.kill();
    gatewayProcess = null;
  }
});

// IPC handlers
ipcMain.handle('get-gateway-url', () => {
  return GATEWAY_URL;
});

ipcMain.handle('check-gateway-status', async () => {
  return await checkGatewayRunning();
});
