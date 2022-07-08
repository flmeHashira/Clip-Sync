let count = 0;


const socket = io('http://localhost:3000');

socket.on('message', (msg) => {
    appendText(msg)
    console.log(msg)
})

const { clipboard } = require('electron')
let watcherId = null


function appendText(msg) {
    const list = document.querySelector('.txtbox');
    if (count == 0) {
        list.value = msg;
        count++;
        return
    }
    const list2 = document.querySelector('.cpy');
    // console.log("Copied\n")
    let elem = document.createElement('textarea');
    elem.value = msg;
    list2.appendChild(elem);
}

function textChanged(msg) {

    appendText(msg)
    socket.emit('message', msg);

}

function startMonitoringClipboard() {
    let previousText = clipboard.readText()


    const isDiffText = (str1, str2) => {
        return str2 && str1 !== str2
    }

    if (!watcherId) {
        watcherId = setInterval(() => {
            if (isDiffText(previousText, previousText = clipboard.readText(previousText))) textChanged(previousText)
        }, 500)
    }
}

startMonitoringClipboard()
