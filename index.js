const electron = require('electron')
const { app, Tray, Menu, nativeImage } = electron
const BrowserWindow = electron.BrowserWindow
const ipcMain = require('electron').ipcMain

const menuItems = [
    [
        {
            label: 'log In',
            click: () => loginWindowCreate()
        },
        {
            label: 'Exit application',
            click: () => callclose()
        }
    ],
    [
        {
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
                workerWindow.webContents.send('pause-history')
            }

        },
        {
            label: 'Resume Sync',
            click: () => {
                workerWindow.webContents.send('resume-history')
            }

        },
        {
            label: 'Log out',
            click: () => userLogOut()
        },
        {
            label: 'Exit application',
            click: () => callclose()
        }
    ]
]



process.chdir(app.getPath('userData'))

let tray, mainWindow, workerWindow, loginWindow, contextMenu, menuSwitch = false

async function startApp() {
    createWindow()
    helperWindow()
}


//Electron Window Functions
app.whenReady().then(startApp)

function createWindow() {
    const path = require('path')
    const image = nativeImage.createFromPath(
        path.join(__dirname, 'icon.jpg')
    )
    tray = new Tray(image.resize({ width: 16, height: 16 }))
    contextMenu = Menu.buildFromTemplate(menuItems[+menuSwitch])
    menuSwitch= !menuSwitch
    tray.setContextMenu(contextMenu)
    tray.setToolTip('open clipboard history')
}

function helperWindow() {
    // create hidden worker window
    workerWindow = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,

        }
    })
    // workerWindow.webContents.openDevTools()
    workerWindow.loadFile('worker.html')
}


function loginWindowCreate()  {
    const path = require('path')
    loginWindow = new BrowserWindow({
        autoHideMenuBar: true,
        show: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }
    })
    // loginWindow.webContents.openDevTools()
    loginWindow.loadFile('login.html')
}

ipcMain.on('write-clipboard', (evt, message) => {
    workerWindow.webContents.send('write-clipboard', message)
})

ipcMain.on('delete-clipboard', (evt, message) => {
    workerWindow.webContents.send('delete-clipboard', message)
})



ipcMain.on('login-attempt', (event, message) => {
    workerWindow.webContents.send('start-auth', message)
})

ipcMain.on('new-user', (evt, message) => {
    workerWindow.webContents.send('register-user', message)
    loginWindow.reload()
})

ipcMain.on('text-changed', (event, msg) => {
    mainWindow.webContents.send('text-changed', msg)
})

ipcMain.on('image-changed', (event, msg) => {
    mainWindow.webContents.send('image-changed', msg)
})


ipcMain.on('login-res', async(event, message) => {
    if(message=='invalid-credentials')
        loginWindow.webContents.send('invalid-login', message)
    else    {
        loginWindow.close()
        loginWindow = null
        await workerWindow.webContents.send('valid-login')
        clip()
        contextMenu = Menu.buildFromTemplate(menuItems[+menuSwitch])
        menuSwitch = !menuSwitch
        tray.setContextMenu(contextMenu)
    }

})


function clip() {
    const path = require('path')
        mainWindow = new BrowserWindow({
        minheight: 500,
        minwidth: 420,
        width: 720,
        height: 480,
        autoHideMenuBar: true,
        closable: false,
        maximizable: true,
        closable: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        }

    })
    // mainWindow.webContents.openDevTools()
    mainWindow.loadFile('Main.html')
    workerWindow.webContents.send('load-all-prev')

    mainWindow.on('minimize', (event) => {
        event.preventDefault()
        mainWindow.hide()
    })
}

async function callclose() {
    await workerWindow.webContents.send('close-realm')
    mainWindow = null
    app.exit()
}

function userLogOut() {
    mainWindow.close()
    mainWindow = null
    contextMenu = Menu.buildFromTemplate(menuItems[+menuSwitch])
    menuSwitch = !menuSwitch
    tray.setContextMenu(contextMenu)
    workerWindow.webContents.send('realm-logOut')
}