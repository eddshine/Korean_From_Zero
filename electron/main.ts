import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initDatabase, loadItem, saveItem, removeItem } from './database'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public')

let mainWindow: BrowserWindow | null

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    icon: path.join(process.env.VITE_PUBLIC!, 'img/kfz_ico.ico'),
    webPreferences: {
      preload: path.join(process.env.VITE_PUBLIC!, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    backgroundColor: '#1a1a2e',
  })

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(process.env.DIST!, 'index.html'))
  }

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-maximized-changed', true)
    saveItem('window_maximized', 'true')
  })

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-maximized-changed', false)
    saveItem('window_maximized', 'false')
  })

  const wasMaximized = loadItem('window_maximized')
  if (wasMaximized === 'true') {
    mainWindow.maximize()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('close', (e) => {
    e.preventDefault()
    mainWindow?.webContents.send('app:confirm-close')
  })
}

ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize()
})

ipcMain.handle('window:maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
    return mainWindow.isMaximized()
  }
  return false
})

ipcMain.handle('window:close', () => {
  mainWindow?.close()
})

ipcMain.handle('app:force-close', () => {
  mainWindow?.destroy()
})

ipcMain.handle('window:isMaximized', () => {
  return mainWindow?.isMaximized() ?? false
})

ipcMain.handle('db:load', (_event, key: string) => {
  return loadItem(key)
})

ipcMain.handle('db:save', (_event, key: string, value: string) => {
  saveItem(key, value)
})

ipcMain.handle('db:remove', (_event, key: string) => {
  removeItem(key)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  initDatabase()
  createWindow()
})
