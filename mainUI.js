
//Insert data to DOM
let count = 0
const loader = setInterval(() => {
    if(count !== 0) {
        document.querySelector('.loader').style.display ="none"
        clearInterval(loader)
    }
}, 500)

const createCardTxt = async(text) => {
    let container = document.querySelector(".container")
    let card_outer = document.createElement('div')
    card_outer.className = 'card-outer'

    let del_btn = document.createElement('div')
    del_btn.className = 'delete-btn'
    del_btn.innerHTML = '<i class="gg-trash"></i>'
    card_outer.appendChild(del_btn)

    let block = document.createElement('div')
    block.className = 'card'
    block.innerHTML = `<textarea readonly>${text}</textarea>`
    card_outer.appendChild(block)
    container.appendChild(card_outer)
    console.log("No of child elements(from txt): ", document.querySelector(".container").childElementCount)
}

const createCardIMG = async(imgSrc) => {
    let container = document.querySelector(".container")
    let card_outer = document.createElement('div')
    card_outer.className = 'card-outer'

    let del_btn = document.createElement('div')
    del_btn.className = 'delete-btn'
    del_btn.innerHTML = '<i class="gg-trash"></i>'
    card_outer.appendChild(del_btn)


    let block = document.createElement('div')
    block.className = 'card'
    const myImg = document.createElement("img")
    let ratio
    myImg.addEventListener('load', (event) => {
        ratio = myImg.naturalWidth / myImg.naturalHeight
        console.log(ratio)
        if (ratio < 0.75) {
            myImg.style.maxWidth = '200px'

        }
        if (ratio > 1.4) {
            myImg.style.maxWidth = '400px'
        }
    })
    myImg.src = imgSrc
    block.appendChild(myImg)
    card_outer.appendChild(block)
    container.appendChild(card_outer)

    console.log("No of child elements(from img): ", document.querySelector(".container").childElementCount)

}


window.electron.ipc.on('text-changed', (evt, msg) => {
    ++count
    createCardTxt(msg)
})
window.electron.ipc.on('image-changed', (evt, msg) => {
    ++count
    createCardIMG(msg)
})

window.electron.ipc.on('clear-history', () => {
    document.querySelector(".container").innerHTML = ""
})


//Upon clicking a card
document.querySelector('.container').addEventListener("click", (e) => {
    const card = e.target.closest(".card")
    const del_btn = e.target.closest(".card-outer")


    if(card){
        clickOnCard(e.target)
        card.style.border = '2.5px ridge #a0b9e5'
        card.style.boxShadow = '-10px -10px 15px rgba(255, 255, 255, 0.5), 10px 10px 15px #c9d8f2ef'
        createRipple(e, card)
        setTimeout(() => {
            card.style.boxShadow = '-10px -10px 15px rgba(255, 255, 255, 0.5), 10px 10px 15px rgba(70, 70, 70, 0.12)'
            card.style.border = '2px solid rgb(71, 71, 71)'
        }, 400)
    }
    else if(del_btn)    {
        deleteCard(del_btn.lastChild)
        document.querySelector(".container").removeChild(del_btn)
    }
})

function deleteCard(card_elem)  {
    console.log(card_elem)
    let content = card_elem.lastChild, msg
    console.log(content)
    if(content.localName.toLowerCase() == "img")
        msg = {type: "img", value: content.src}
    else
        msg = {type: "txt", value: content.innerHTML}
    console.log(msg)
    window.electron.ipc.send('delete-clipboard', msg)
}


function clickOnCard(content)  {
    let msg
    if(content.localName.toLowerCase() == "img")
        msg = {type: "img", value: content.src}
    else
        msg = {type: "txt", value: content.innerHTML}

    window.electron.ipc.send('write-clipboard', msg)
}

function createRipple(event, target) {
    const card = target //event.currentTarget
  
    const circle = document.createElement("span")
    const diameter = Math.max(card.clientWidth, card.clientHeight)
    const radius = diameter / 2

    circle.style.width = circle.style.height = `${diameter}px`
    circle.style.left = `${event.x - card.offsetLeft - radius}px`
    circle.style.top = `${event.y - card.offsetTop - radius + event.scrollLeft}px`
    circle.classList.add("ripple")
  
    const ripple = card.getElementsByClassName("ripple")[0]
    card.appendChild(circle)
}