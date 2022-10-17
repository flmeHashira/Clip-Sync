const electron = require('electron')
const clipboard = electron.clipboard
const path = require('path')
const { app, Tray, Menu, nativeImage } = electron
const BrowserWindow = electron.BrowserWindow
const Realm = require("realm")
const { UUID } = Realm.BSON
const crypto = require('crypto')
const ipcMain = require('electron').ipcMain


let win
let tray

//Realm Database

const Schema = {
    name: "clipContent",
    properties: {
        _id: "uuid",
        type: "string",
        value: "string",
        SHA: { type: "string", indexed: true },
    },
    primaryKey: "_id",
};


const realm = new Realm({
    path: "myrealm",
    schema: [Schema],
    deleteRealmIfMigrationNeeded: true
});

// realm.write(() => {
//     // Delete all instances of Cat from the realm.
//     realm.delete(realm.objects("clipContent"));
// });

function checkifRealmEmpty(realm, query) {
    return realm.objects(query).length;
}

app.whenReady().then(() => {
    createWindow()
});


//Electron Window Functions
function newwin() {
    win = new BrowserWindow({
        minheight: 640,
        minwidth: 800,
        maxheight: 640,
        maxwidth: 800,
    });
    win.loadFile('main.html')
}

function createWindow() {
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
    win.loadFile('Main.html')
    win.once('ready-to-show', () => {
        if (checkifRealmEmpty(realm, "clipContent")) {
            let list = realm.objects("clipContent")
            list.forEach((element) => {
                win.webContents.send('text-changed', element.value)
                console.log(element.value)
            })
        }
    })
    win.on('minimize', (event) => {
        event.preventDefault()
        win.hide()
    })
}


function callclose() {
    clearInterval(watcherId)
    realm.close();
    win = null
    app.exit()
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
    const watchDelay = 800;
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
            textChanged(text)
            console.log("text changed")
        }
    }, watchDelay)
}


//Clipboard Change Events

async function textChanged(text) {
    const hash = crypto.createHash('sha256')
    let hashData = await hash.update(text, 'utf-8');
    realm.write(async() => {
        // Assign a newly-created instance to the variable.
        realm.create("clipContent", {
            _id: new UUID(),
            type: "text",
            value: text,
            SHA: hashData.digest('hex')
        });
    });
    win.webContents.send('text-changed', text)

}