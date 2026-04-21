const { app, BrowserWindow } = require('electron');
const path = require('path');


const createWindow = () => {
  const win = new BrowserWindow({
    width: 450,
    height: 800,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // opcional
    },
  });

  // Si estás en desarrollo (vite dev)
  if (!app.isPackaged) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
};

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});