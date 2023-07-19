const electron = require('electron')
const clipboard = electron.clipboard
const Realm = require("realm")
const { UUID } = Realm.BSON;
const ipc = electron.ipcRenderer
const realmAPI = require('./realmAPIs')


let lastText, lastImage = clipboard.readImage();

//Realm Implementation
let realm;
let userID, syncSession;


//Realm User Auth
async function realmAuth(credentials) {
    const user = await realmAPI.RealmAuths(1, credentials);
    if (user == null) {
        ipc.send('login-res', 'invalid-credentials');
    }
        ipc.send('login-res', 'login-complete');
    userID = user.id;
    const realm_= await realmAPI.openRealm(user)
    realm = realm_;
    syncSession = realm.syncSession;
    await realmAPI.addSubscription(realm, realm.objects("clipContent"))
}

//Watch for Updates in Database
function watchUpdates() {
    const clipContent = realm.objects("clipContent")
    try {
        clipContent.addListener(onClipChange);
    } catch (error) {
        console.error(
            `An exception was thrown within the change listener: ${error}`
        );
    }
}


function onClipChange(clipContent, changes) {
    changes.deletions.forEach((index) => { });
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
    changes.modifications.forEach((index) => { });
    //Order of handling event matters
}



ipc.on('close-realm', async () => {
    // Log out the current user
    await realm.close();
    await realmAPI.logOut;
})

ipc.on('clear-history', () => {
    realmAPI.clearDatabase(realm);
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

ipc.on('register-user', async (event, crendentials) => {
    await realmAPI.registerUser(crendentials);
})

ipc.on('start-auth', async (event, credentials) => {
    await realmAuth(credentials);
})


//Load all previous history on new Window
ipc.on('load-all-prev', () => {
    console.log(userID)
    console.log(realm)
    if (!realm.empty) {
        let list = realm.objects("clipContent").filtered("owner_id == $0", userID)
        list.forEach((element) => {
            if (element.type == "text")
                ipc.send('text-changed', element.value)
            else
                ipc.send('image-changed', element.value)
        })
    }
})


ipc.on('write-clipboard', (event, message) => {
    if (message.type == 'img') {
        let image = electron.nativeImage.createFromDataURL(message.value)
        clipboard.writeImage(image);
        lastImage = image;
    }
 {
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
            console.log("Image Changed from worker", lastImage)
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
    await realm.write(() => {
        // Assign a newly-created instance to the variable.
        realm.create("clipContent", {
            owner_id: userID,
            _id: new UUID(),
            type: "text",
            value: text,
        });
    });

}

async function imageChanged(image) {
    await realm.write(() => {
        // Assign a newly-created instance to the variable.
        realm.create("clipContent", {
            owner_id: userID,
            _id: new UUID(),
            type: "image",
            value: image,
        });
    });
}