const electron = require('electron')
const ipcMain = require('electron')
const path = require('path')
const { app, Menu, Tray } = electron
const BrowserWindow = electron.BrowserWindow //for web page 


let mainWindow;
let tray
app.on('ready', _ => {
    tray = new Tray(path.join(__dirname, 'icon.jpg'))
    const contextMenu = Menu.buildFromTemplate([{
            label: 'Open Cliboard',
            click: () => clip()
        },
        {
            label: 'Start at startup',

        },
        {
            label: 'About Us',
            click: () => newwin()
        },
        {
            label: 'Exit application',
            click: () => callclose()
        }
    ])
    tray.setContextMenu(contextMenu)
});

function newwin() {
    win = new BrowserWindow({
        minheight: 640,
        minwidth: 800,
        maxheight: 640,
        maxwidth: 800,
    });
    win.loadFile('main.html')
}

function clip() {

    win = new BrowserWindow({
        minheight: 500,
        minwidth: 420,
        // maxHeight: 500,
        // maxWidth: 420,
        width: 420,
        height: 500,
        autoHideMenuBar: true,
        closable: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true, // is default value after Electron v5
            contextIsolation: false, // protect against prototype pollution
            enableRemoteModule: true, // turn off remote
        }

    })
    win.webContents.openDevTools();
    // win.loadFile('Main.html')
    win.loadURL('http://localhost:3000')

    win.on('minimize', function(event) {
        event.preventDefault()
        win.hide()
    })
}


function callclose() {
    app.exit()
    win = null
}