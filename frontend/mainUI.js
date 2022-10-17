const { io } = require("socket.io-client")
const socket = io('http://localhost:3000')
const electron = require('electron')
const ipc = electron.ipcRenderer
const Realm = require("realm")

socket.on('message', (msg) => {
    CreatecardElemTxt(msg)
})


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