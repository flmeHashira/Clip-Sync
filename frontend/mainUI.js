
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

// window.electron.writeText("HeheBoii");

//Upon clicking a card
document.querySelector('.container').addEventListener("click", (e) => {
    const target = e.target.closest(".card");

    if(target){
        clickOnCard(e.target);
        target.style.border = '2.5px ridge #a0b9e5';
        target.style.boxShadow = '-10px -10px 15px rgba(255, 255, 255, 0.5), 10px 10px 15px #c9d8f2ef';
        createRipple(e, target);
        setTimeout(() => {
            target.style.boxShadow = '-10px -10px 15px rgba(255, 255, 255, 0.5), 10px 10px 15px rgba(70, 70, 70, 0.12)';
            target.style.border = '2px solid rgb(71, 71, 71)';
        }, 400);
    }
});


function clickOnCard(content)  {
    console.log(content)
    let msg;
    if(content.localName.toLowerCase() == "img")   {
        msg = {type: "img", value: content.src};
        window.electron.ipc.send('write-clipboard', msg)
    }
    else    {
        msg = {type: "txt", value: content.innerHTML};
        window.electron.ipc.send('write-clipboard', msg)
    }
}

function createRipple(event, target) {
    const button = target;
  
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
  
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
    circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
    circle.classList.add("ripple");
  
    const ripple = button.getElementsByClassName("ripple")[0];
  
    if (ripple) {
      ripple.remove();
    }
  
    button.appendChild(circle);
}