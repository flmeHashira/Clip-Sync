const { io } = require("socket.io-client")
const socket = io('http://localhost:3000')
const electron = require('electron')
const ipc = electron.ipcRenderer

socket.on('message', (msg) => {
    CreatecardElemTxt(msg)
})

// const { clipboard } = require('electron')
// let watcherId = null


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

// function textChanged(msg) {

//     CreatecardElemTxt(msg)
//     socket.emit('message', msg);

// }

ipc.on('text-changed', (evt, msg) => {
    console.log(msg)
    CreatecardElemTxt(msg)
})

// async function startMonitoringClipboard() {
//     let previousText = clipboard.readText()


//     const isDiffText = (str1, str2) => {
//         return str2 && str1 !== str2
//     }

//     if (!watcherId) {
//         watcherId = setInterval(() => {
//             if (isDiffText(previousText, previousText = clipboard.readText(previousText))) textChanged(previousText)
//         }, 500)
//     }
// }

// startMonitoringClipboard()

let cards = document.querySelectorAll('.card');
cards.forEach(card => {
    card.addEventListener('click', () => {
        alert("Copied");
    })
});