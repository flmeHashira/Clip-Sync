
//Insert data to DOM

const createCardTxt = async(text) => {
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
    container.appendChild(block);
    (block.lastElementChild).lastElementChild.src = imgSrc

}


window.electron.ipc.on('text-changed', (evt, msg) => {
    console.log(msg)
    createCardTxt(msg)
})
window.electron.ipc.on('image-changed', (evt, msg) => {
    createCardIMG(msg)
})


let cards = document.querySelectorAll('.card');
cards.forEach(card => {
    card.addEventListener('click', () => {
        alert("Copied");
    })
});