const { io } = require("socket.io-client")
const socket = io('http://localhost:3000')
const electron = require('electron')
const ipc = electron.ipcRenderer
const Realm = require("realm")

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

const img1 = "https://images.unsplash.com/photo-1619024370140-d625f2e354f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=987&q=80"
const img2 = "https://images.unsplash.com/photo-1514589553259-ed2658dad420?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3016&q=80"
const img3 = "https://i.imgur.com/Ji9Ge19.jpg";

const CreatecardElemTxt = async(text) => {
    let container = document.querySelector(".container");
    let cardElem = `<div class="card">
        <textarea readonly></textarea>
    </div>`;
    let block = document.createElement('div');
    block.innerHTML = cardElem;
    // console.log(cardElem);
    (block.lastElementChild).lastElementChild.innerHTML = text;
    container.appendChild(block);
}


const createCardIMG = async(imgSrc) => {
    let container = document.querySelector(".container")
    let cardElem = `<div class="card"><img src="" alt=""></div>`;
    let block = document.createElement('div')
    block.innerHTML = cardElem;
    let parent = block.lastElementChild;
    let myImg = parent.lastElementChild;
    let ratio;
    myImg.addEventListener('load', (event) => {
        ratio = myImg.naturalWidth / myImg.naturalHeight;
        console.log(ratio);
        if (ratio < 0.75) {
            parent.style.maxWidth = '200px';

        }
        if (ratio > 1.4) {
            parent.style.maxWidth = '400px'
        }
    });
    // add logo to the document
    // (parent.lastElementChild).style.aspectRatio = `${ratio}`;
    // console.log(1 / ratio)
    container.appendChild(block);
    (block.lastElementChild).lastElementChild.src = imgSrc

}

createCardIMG(img1)
createCardIMG(img2)
createCardIMG(img3)


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