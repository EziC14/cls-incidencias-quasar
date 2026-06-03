const { app, BrowserWindow, screen, ipcMain } = require('electron')
const path = require('path')
const odbc = require('odbc')

let mainWindow
const DB2_SYSTEM = '192.168.1.5'
const DB2_LIBRARY = 'CLS'
const connectionPool = {}

function buildConnStr(user, password) {
  return `DRIVER={IBM i Access ODBC Driver};SYSTEM=${DB2_SYSTEM};UID=${user};PWD=${password};DefaultLibraries=${DB2_LIBRARY};Naming=0;`
}

async function getConnection(user, password) {
  const key = `${user}:${password}`
  if (connectionPool[key]) {
    try {
      await connectionPool[key].query("SELECT 1 FROM SYSIBM.SYSDUMMY1")
      return connectionPool[key]
    } catch (e) {
      delete connectionPool[key]
    }
  }
  const conn = await odbc.connect(buildConnStr(user, password))
  connectionPool[key] = conn
  return conn
}

ipcMain.handle('db:login', async (event, { usuario, clave }) => {
  const conn = await getConnection(usuario, clave)
  await conn.query("SELECT * FROM SYSIBM.SYSDUMMY1")
  return { success: true, usuario }
})

ipcMain.handle('db:query', async (event, { sql, params, usuario, clave }) => {
  const conn = await getConnection(usuario, clave)
  return await conn.query(sql, params || [])
})

setInterval(() => {
  for (const key of Object.keys(connectionPool)) {
    connectionPool[key].close().catch(() => {})
    delete connectionPool[key]
  }
}, 300000)

async function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  mainWindow = new BrowserWindow({
    width: Math.min(1400, width),
    height: Math.min(900, height),
    minWidth: 1024,
    minHeight: 700,
    icon: path.join(__dirname, '..', 'public', 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(process.env.QUASAR_ELECTRON_PRELOAD_FOLDER, 'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION)
    },
    frame: true,
    show: false
  })

  if (process.env.DEV) {
    mainWindow.loadURL(process.env.APP_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile('index.html')
  }

  mainWindow.once('ready-to-show', () => mainWindow.show())
  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => app.quit())
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})