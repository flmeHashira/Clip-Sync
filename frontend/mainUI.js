const { io } = require("socket.io-client")
const socket = io('http://localhost:3000')
const electron = require('electron')
const ipc = electron.ipcRenderer
const Realm = require("realm")
const { Collection } = require("realm")

socket.on('message', (msg) => {
    CreatecardElemTxt(msg)
})


//Watch for changes in database

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
    deleteRealmIfMigrationNeeded: true,
});

const clipContent = realm.objects("clipContent")

function onClipChange(clipContent, changes) {
    changes.deletions.forEach((index) => {});
    // Handle newly inserted clipboard content
    changes.insertions.forEach((index) => {
        const insertedData = clipContent[index]
        let msg = insertedData.value
        console.log("\nMessage is:" + msg)
        CreatecardElemTxt(msg)

    });
    // Handle clipboard objects that were modified
    changes.modifications.forEach((index) => {});
    //Order of handling event matters
}

try {
    clipContent.addListener(onClipChange);
} catch (error) {
    console.error(
        `An exception was thrown within the change listener: ${error}`
    );
}


//Insert data to DOM

const CreatecardElemTxt = (text) => {
    let container = document.querySelector(".container");
    let cardElem = `<div class="card">
        <textarea readonly></textarea>
    </div>`;
    let block = document.createElement('div');
    block.innerHTML = cardElem;
    console.log(cardElem);
    (block.lastElementChild).lastElementChild.innerHTML = text;
    container.appendChild(block);
}


ipc.on('text-changed', (evt, msg) => {
    console.log(msg)
    CreatecardElemTxt(msg)
})


let cards = document.querySelectorAll('.card');
cards.forEach(card => {
    card.addEventListener('click', () => {
        alert("Copied");
    })
});