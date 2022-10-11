const electron = require('electron')
const path = require('path')
const { app, Tray, Menu, nativeImage } = electron
const BrowserWindow = electron.BrowserWindow


let mainWindow;
let tray
app.whenReady().then(() => {
    const image = nativeImage.createFromPath(
        path.join(__dirname, 'icon.jpg')
    );
    tray = new Tray(image.resize({ width: 16, height: 16 }));
    const contextMenu = Menu.buildFromTemplate([{
            label: 'Open Cliboard',
            click: () => clip()
        },
        // {
        //     label: 'Start at startup',

        // },
        // {
        //     label: 'About Us',
        //     click: () => newwin()
        // },
        {
            label: 'Exit application',
            click: () => callclose()
        }
    ])
    tray.setContextMenu(contextMenu)
    tray.setToolTip('open clipboard history')
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
        maximizable: true,
        webPreferences: {
            nodeIntegration: true, // is default value after Electron v5
            contextIsolation: false, // protect against prototype pollution
            enableRemoteModule: true, // turn off remote
        }

    })
    win.webContents.openDevTools();
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