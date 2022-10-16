const electron = require('electron')
const clipboard = electron.clipboard
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
    startMonitoringClipboard()
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
        // win.webContents.openDevTools();
    win.loadFile('Main.html')

    win.on('minimize', function(event) {
        event.preventDefault()
        win.hide()
    })
}

//Clipboard Monitoring Starts here

function imageHasDiff(a, b) {
    return !a.isEmpty() && b.toDataURL() !== a.toDataURL()
}

function textHasDiff(a, b) {
    return a && b !== a
}
let watcherId = null;
async function startMonitoringClipboard() {
    const watchDelay = 500;
    let lastText = clipboard.readText()
    let lastImage = clipboard.readImage()

    watcherId = setInterval(() => {
        const text = clipboard.readText()
        const image = clipboard.readImage()

        if (imageHasDiff(image, lastImage)) {
            lastImage = image
            console.log("Image changed")
        }

        if (textHasDiff(text, lastText)) {
            lastText = text
            console.log("text changed")
        }
    }, watchDelay)
}




function callclose() {
    clearInterval(watcherId)
    app.exit()
    win = null
}