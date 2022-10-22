const electron = require('electron')
const clipboard = electron.clipboard
const Realm = require("realm")
const { UUID } = Realm.BSON;
const ipc = electron.ipcRenderer


const Schema = {
    name: "clipContent",
    properties: {
        _id: "uuid",
        type: "string",
        value: "string",
    },
    primaryKey: "_id",
};

const realm = new Realm({
    path: "myrealm",
    schema: [Schema],
    deleteRealmIfMigrationNeeded: true,
});

console.log(clipboard.readText())

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
            lastText = text
            lastImage = image
            imageChanged(image.toDataURL());
        }

        if (textHasDiff(text, lastText)) {
            lastText = text
            textChanged(text)
            console.log("hellooooo")
            console.log("text changed")
        }
    }, watchDelay)
}


//Clipboard Change Events

async function textChanged(text) {
    realm.write(async() => {
        // Assign a newly-created instance to the variable.
        realm.create("clipContent", {
            _id: new UUID(),
            type: "text",
            value: text,
        });
    });

}

async function imageChanged(image) {
    realm.write(async() => {
        // Assign a newly-created instance to the variable.
        realm.create("clipContent", {
            _id: new UUID(),
            type: "image",
            value: image,
        });
    });
}

startMonitoringClipboard()