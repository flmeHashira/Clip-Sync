const electron = require('electron')
const { app, Tray, Menu, nativeImage } = electron
const path = require('path')
const BrowserWindow = electron.BrowserWindow
const ipcMain = require('electron').ipcMain;

let tray, mainWindow, workerWindow, loginWindow, contextMenu;

async function startApp() {
    createWindow();
    helperWindow();
}


//Electron Window Functions
app.whenReady().then(startApp)

function createWindow() {
    const image = nativeImage.createFromPath(
        path.join(__dirname, 'icon.jpg')
    );
    tray = new Tray(image.resize({ width: 16, height: 16 }));
    contextMenu = Menu.buildFromTemplate([{
            label: 'log In',
            click: () => loginWindowCreate()
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
    // workerWindow.webContents.openDevTools();
    workerWindow.loadFile('worker.html');
}


function loginWindowCreate()  {
    loginWindow = new BrowserWindow({
        show: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true

        }
    });
    loginWindow.loadFile('login.html');
}

ipcMain.on('login-attempt', (event, message) => {
    console.log("Recieved login detail on mainframe");
    console.log(message);
    workerWindow.webContents.send('start-auth', message);
})

ipcMain.on('login-res', (event, message) => {
    if(message=='invalid-credentials')
        loginWindow.webContents.send('invalid-login', message);
    else    {
        workerWindow.webContents.send('valid-login');
        loginWindow.close();
        loginWindow = null;
        clip();
        contextMenu = Menu.buildFromTemplate([{
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
        }])
        tray.setContextMenu(contextMenu)
    }

})


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

function callclose() {
    workerWindow.webContents.send('close-realm')
    mainWindow = null
    app.exit()
}