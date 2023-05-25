const electron = require('electron')
const clipboard = electron.clipboard
const Realm = require("realm")
const { UUID } = Realm.BSON;
const ipc = electron.ipcRenderer
const realmAPI = require('./realmAPIs')


let lastText, lastImage = clipboard.readImage();

//Realm Implementation
const realms = {};
let userID, syncSession;

//Realm User Auth
async function realmAuth(credentials) {
    const user = await realmAPI.RealmAuths(1, credentials);
    if(user == null)
        ipc.send('login-res', 'invalid-credentials');
    else
        ipc.send('login-res', 'login-complete');
    userID = user.id;
    realms[userID] = await realmAPI.openRealm(user)
    syncSession = realms[userID].syncSession;
    await realmAPI.addSubscription(realms[userID], realms[userID].objects("clipContent"))
}

//Watch for Updates in Database
function watchUpdates() {
    const clipContent = realms[userID].objects("clipContent")
    try {
        clipContent.addListener(onClipChange);
    } catch (error) {
        console.error(
            `An exception was thrown within the change listener: ${error}`
        );
    }
}


function onClipChange(clipContent, changes) {
    changes.deletions.forEach((index) => {});
    // Handle newly inserted clipboard content
    changes.insertions.forEach((index) => {
        const insertedData = clipContent[index]
        let msg = insertedData.value;
        let type = insertedData.type;
        if (type == "text")
            ipc.send('text-changed', msg)
        else
            ipc.send('image-changed', msg)

    });
    // Handle clipboard objects that were modified
    changes.modifications.forEach((index) => {});
    //Order of handling event matters
}



ipc.on('close-realm', () => {
    realms[userID].close()
})

ipc.on('clear-history', () => {
    realmAPI.clearDatabase(realms[userID]);
})

ipc.on('pause-history', () => {
    syncSession.pause()
})
ipc.on('resume-history', () => {
    syncSession.resume()
})

ipc.on('valid-login', () => {
    startMonitoringClipboard();
    watchUpdates();
})

ipc.on('register-user', async(event, crendentials) => {
    await realmAPI.registerUser(crendentials);
})

ipc.on('start-auth', async (event, credentials) => {
    await realmAuth(credentials);
})


//Load all previous history on new Window
ipc.on('load-all-prev', () => {
    
    console.log("Loading all prevs")
    if (!realms[userID].empty) {
        let list = realms[userID].objects("clipContent")
        list.forEach((element) => {
            if (element.type == "text")
                ipc.send('text-changed', element.value)
            else
                ipc.send('image-changed', element.value)
        })
    }
})


ipc.on('write-clipboard', (event, message) => {
    if(message.type == 'img')   {
        let image = electron.nativeImage.createFromDataURL(message.value)
        clipboard.writeImage(image);
        lastImage = image;
    }
    else    {
        clipboard.writeText(message.value);
        lastText = message.value;
    }
})


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
    lastText = clipboard.readText()
    lastImage = clipboard.readImage()

    watcherId = setInterval(() => {
        const text = clipboard.readText()
        const image = clipboard.readImage()

        if (imageHasDiff(image, lastImage)) {
            lastText = text
            lastImage = image
            imageChanged(image.toDataURL());
            console.log("Image Changed")
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
    await realms[userID].write(() => {
        // Assign a newly-created instance to the variable.
        realms[userID].create("clipContent", {
            _id: new UUID(),
            type: "text",
            value: text,
        });
    });

}

async function imageChanged(image) {
    await realms[userID].write(() => {
        // Assign a newly-created instance to the variable.
        realms[userID].create("clipContent", {
            _id: new UUID(),
            type: "image",
            value: image,
        });
    });
}