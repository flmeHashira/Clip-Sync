require('dotenv').config();
const electron = require('electron')
const clipboard = electron.clipboard
const path = require('path')
const { app, Tray, Menu, nativeImage } = electron
const BrowserWindow = electron.BrowserWindow
const Realm = require("realm")
const { UUID } = Realm.BSON;
const crypto = require('crypto')
const ipcMain = require('electron').ipcMain


let tray, win;

//Realm Local Database
const realmApp = new Realm.App({ id: "clip-sync-ehley" });


const Schema = {
    name: "clipContent",
    properties: {
        _id: "uuid",
        type: "string",
        value: "string",
        SHA: { type: "string", indexed: true },
    },
    primaryKey: "_id",
    sync: {
        user: realmApp.currentUser,
        flexible: true,
    },
};

const realm = new Realm({
    path: "myrealm",
    schema: [Schema],
    deleteRealmIfMigrationNeeded: true,
});

//Realm Auth
async function RealmAuths() {
    const email = process.env.email;
    const password = process.env.password;

    // Create an email/password credential
    const credentials = Realm.Credentials.emailPassword(
        email,
        password
    );
    try {
        const user = await realmApp.logIn(credentials);
        console.log("Successfully logged in!", user.id);
        return user;
    } catch (err) {
        console.error("Failed to log in", err.message);
    }
}

const syncSession = realm.syncSession;

//Electron Window Functions
app.whenReady().then(() => {
    createWindow()
        // RealmAuths()
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
            click: () => clearHistory()

        },
        {
            label: 'Pause',
            click: () => { syncSession.pause() }

        },
        {
            label: 'Resume Sync',
            click: () => { syncSession.resume() }

        },
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

    let win = new BrowserWindow({
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
    win.webContents.openDevTools();
    win.loadFile('Main.html')
    win.once('ready-to-show', () => {
        if (!realm.empty) {
            let list = realm.objects("clipContent")
            list.forEach((element) => {
                if (element.type == "text")
                    win.webContents.send('text-changed', element.value)
                else
                    win.webContents.send('image-changed', element.value)
            })
        }
    })
    win.on('close', (event) => {
        if (!app.isQuiting) {
            event.preventDefault();
            win.hide();
        }

    })

    win.on('minimize', (event) => {
        event.preventDefault()
        win.hide()
    })
}

function clearHistory() {
    realm.write(() => {
        // Delete all instances of Cat from the realm.
        realm.delete(realm.objects("clipContent"));
    });
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
            imageChanged(image.toDataURL());
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

async function imageChanged(image) {
    const hash = crypto.createHash('sha256')
    let hashData = await hash.update(image, 'utf-8');
    realm.write(async() => {
        // Assign a newly-created instance to the variable.
        realm.create("clipContent", {
            _id: new UUID(),
            type: "image",
            value: image,
            SHA: hashData.digest('hex')
        });
    });
    win.webContents.send('image-changed', image)

}