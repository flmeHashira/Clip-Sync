require('dotenv').config();
const electron = require('electron')
const clipboard = electron.clipboard
const path = require('path')
const { app, Tray, Menu, nativeImage } = electron
const BrowserWindow = electron.BrowserWindow
const Realm = require("realm")
const ipcMain = require('electron').ipcMain


let tray, mainWindow, workerWindow;

//Realm Local Database
const realmApp = new Realm.App({ id: "clip-sync-ehley" });


const Schema = {
    name: "clipContent",
    properties: {
        _id: "uuid",
        type: "string",
        value: "string",
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
    helperWindow()
    createWindow()
        // RealmAuths()
});

function newwin() {
    mainWindow = new BrowserWindow({
        minheight: 640,
        minwidth: 800,
        maxheight: 640,
        maxwidth: 800,
    });
    mainWindow.loadFile('main.html')
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
        if (!realm.empty) {
            let list = realm.objects("clipContent")
            list.forEach((element) => {
                if (element.type == "text")
                    mainWindow.webContents.send('text-changed', element.value)
                else
                    mainWindow.webContents.send('image-changed', element.value)
            })
        }
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
}

function clearHistory() {
    realm.write(() => {
        realm.delete(realm.objects("clipContent"));
    });
}

function callclose() {
    realm.close();
    mainWindow = null
    app.exit()
}