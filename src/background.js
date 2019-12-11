'use strict'

import { app, protocol, BrowserWindow } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import bufferUtil from 'bufferutil';
import { Buffer } from 'buffer';
import crypto from 'crypto';
import {autoUpdater} from 'electron-updater';
import { ipcMain } from 'electron';

const isDevelopment = process.env.NODE_ENV !== 'production'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: { secure: true, standard: true } }])

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({ width: 800, height: 600, webPreferences: {
    nodeIntegration: true
  } })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }

  win.on('closed', () => {
    win = null
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

app.on('ready', async () => {
  createWindow();

  function sendVersionInfo(checkingUpdate, hasUpdate) {
    win.webContents.send('version-info', {
      version: app.getVersion(),
      checkingUpdate,
      hasUpdate,
    });
  }

  win.webContents.on('did-finish-load', () => {
    sendVersionInfo(false, false);
  })

  autoUpdater.autoDownload = false;
  autoUpdater.on('checking-for-update', () => {
    sendVersionInfo(true, false);
  });

  autoUpdater.on('update-available', info => {
    console.log('Update available:', info);
    sendVersionInfo(false, true);
  });

  autoUpdater.on('update-not-available', () => {
    sendVersionInfo(false, false);
  });

  autoUpdater.on('download-progress', info => {
    win.webContents.send('update-progress', info.percent);
  });

  autoUpdater.on('update-downloaded', () => {
    console.log('Update downloaded');
    win.webContents.send('update-ready-for-install');
  });

  autoUpdater.on('error', e => {
    console.log('autoupdater error:', e);
  });

  ipcMain.on('check-for-update', async () => {
    try {
      await autoUpdater.checkForUpdates();
    } catch (e) {
      console.log('Error checking for updates:', e);
      sendVersionInfo(false, false);
    }
  });

  ipcMain.on('download-update', async () => {
    try {
      await autoUpdater.downloadUpdate();
    } catch {
    }
  });

  ipcMain.on('install-update', () => {
    autoUpdater.quitAndInstall();
  });

  // Run native tests
  try {
    {
      const origSource = crypto.randomBytes(10);
      const source = Buffer.from(origSource);
      const mask = crypto.randomBytes(4);

      bufferUtil.mask(source, mask, source, 0, source.length);

      if (Buffer.compare(origSource, source) === 0) throw new Error('bufferutil test failed (mask)');
      bufferUtil.unmask(source, mask);
      if (Buffer.compare(origSource, source) !== 0) throw new Error('bufferutil test failed (unmask)');
    }

    {
      const isValidUTF8 = require('utf-8-validate');
      const buf = Buffer.from([0xf0, 0x90, 0x80, 0x80]);
      if (!isValidUTF8(buf)) throw new Error('utf-8-validate test failed');
    }

    await new Promise((resolve, reject) => {
      const sqlite3 = require('sqlite3').verbose();
      const db = new sqlite3.Database(':memory:');

      db.serialize(function() {
        db.run("CREATE TABLE dummy (id INTEGER PRIMARY KEY)");

        const stmt = db.prepare("INSERT INTO dummy VALUES (?)");
        for (let i = 0; i < 10; i++) {
            stmt.run(i);
        }
        stmt.finalize();

        let expectedNum = 0;
        db.each("SELECT id FROM dummy ORDER BY id ASC", function(err, row) {
          if (err) throw new Error(err);
          if (row.id !== expectedNum++) reject(new Error('sqlite test failed (row retrieval)'));
          if (expectedNum === 10) resolve();
        });
      });

      db.close();
    });

    console.log('bufferutil, utf-8-validate, and sqlite tests passed');
  } catch (e) {
    console.log('native node module tests failed:', e);
  }
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
