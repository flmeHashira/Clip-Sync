const electron = require('electron')
const { app, Tray, Menu, nativeImage } = electron
const path = require('path')
const BrowserWindow = electron.BrowserWindow
const ipcMain = require('electron').ipcMain;

let tray, mainWindow, workerWindow;

async function startApp() {
    createWindow();
    helperWindow();
    workerWindow.webContents.send('start-auth', "demo")
}


//Electron Window Functions
app.whenReady().then(startApp)

function createWindow() {
    const image = nativeImage.createFromPath(
        path.join(__dirname, 'icon.jpg')
    );
    tray = new Tray(image.resize({ width: 16, height: 16 }));
    const contextMenu = Menu.buildFromTemplate([{
            label: 'Open Cliboard',
            click: () => clip()
        },
        {
            label: 'Clear History',
            click: () => {
                workerWindow.webContents.send('clear-history')
            }

        },
        {
            label: 'Pause',
            click: () => {
                workerWindow.webContents.send('pause-history');
            }

        },
        {
            label: 'Resume Sync',
            click: () => {
                workerWindow.webContents.send('resume-history');
            }

        },
        {
            label: 'Exit application',
            click: () => callclose()
        }
    ])
    tray.setContextMenu(contextMenu)
    tray.setToolTip('open clipboard history')
}

function helperWindow() {
    // create hidden worker window
    workerWindow = new BrowserWindow({
        show: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true

        }
    });
    workerWindow.webContents.openDevTools();
    workerWindow.loadFile('worker.html');
}

function clip() {

    let mainWindow = new BrowserWindow({
        minheight: 500,
        minwidth: 420,
        // maxHeight: 500,
        // maxWidth: 420,
        width: 720,
        height: 480,
        autoHideMenuBar: true,
        closable: false,
        maximizable: true,
        closable: true,
        webPreferences: {
            nodeIntegration: true, // is default value after Electron v5
            contextIsolation: false, // protect against prototype pollution
            enableRemoteModule: true, // turn off remote
        }

    })
    mainWindow.webContents.openDevTools();
    mainWindow.loadFile('Main.html')
    mainWindow.once('ready-to-show', () => {
        workerWindow.webContents.send('load-all-prev');
    })
    mainWindow.on('close', (event) => {
        if (!app.isQuiting) {
            event.preventDefault();
            mainWindow.hide();
        }

    })

    mainWindow.on('minimize', (event) => {
        event.preventDefault()
        mainWindow.hide()
    })
    ipcMain.on('text-changed', (event, text) => {
        mainWindow.webContents.send('text-changed', text)
    })

    ipcMain.on('image-changed', (event, image) => {
        mainWindow.webContents.send('image-changed', image)
    })
}

async function callclose() {
    await workerWindow.webContents.send('close-realm')
    mainWindow = null
    app.exit()
}