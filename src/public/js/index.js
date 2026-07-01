const socket = new WebSocket("ws://localhost:9000")

const mainMenu = document.querySelector("#main-menu")
const playButton = document.querySelector("#play-button")
const gameMode = document.querySelector("#game-mode")
const rightButton = document.querySelector("#right-button")
const leftButton = document.querySelector("#left-button")

const customGameButton = document.querySelector("#custom-game")
const customGameInput = document.querySelector("#custom-game-input")

const chooseTeamsMenu = document.querySelector("#choose-team-menu")
const buttonTeam1 = document.querySelector("#team1")
const buttonTeam2 = document.querySelector("#team2")
const buttonTeam3 = document.querySelector("#team3")

const gameModes = ["team", "survival", "invasion", "deathmatch pro"]
let modeIndex = 0

const gameCanvas = document.querySelector("#rendering-canvas")

rightButton.addEventListener("click", () =>
{
    if(modeIndex >= gameModes.length - 1)
    {
        modeIndex = 0
        updateText()
        return
    }
    modeIndex += 1
    updateText()
})

leftButton.addEventListener("click", () =>
{
    if(modeIndex <= 0)
    {
        modeIndex = gameModes.length - 1
        updateText()
        return
    }
    modeIndex -= 1
    updateText()
})

socket.addEventListener("open", () =>
{
    console.log("connected to server")
})

socket.addEventListener("message", (message) =>
{
    let msg = JSON.parse(message.data)
    if(msg.name === "chooseTeam")
    {
        mainMenu.style.display = "none"
        chooseTeamsMenu.style.display = "block"
        console.log("choose team")
    }
    else if(msg.name === "gameStart")
    {
        onGameStart()
    }

})

playButton.addEventListener("click", () =>
{
    console.log("click")
    socket.send(JSON.stringify(
        {
            name : "play",
            mode : `${gameModes[modeIndex]}`
            
        })
    )
})

customGameButton.addEventListener("click", () =>
{
    socket.send(JSON.stringify(
        {
            name : "customGame",
            link : `${customGameInput.value}`
        })
    )
})

function updateText()
{
    gameMode.innerHTML = `<div>${gameModes[modeIndex]}</div>`
}

buttonTeam1.addEventListener("click", () => chooseTeam(0))
buttonTeam2.addEventListener("click", () =>  chooseTeam(1))
buttonTeam3.addEventListener("click", () =>  chooseTeam(2))

function chooseTeam(team)
{
    socket.send(JSON.stringify(
        {
            name : "canStart",
            mode : "team",
            data : 
            {
                teamNumber : team
            }
        }
    ))
}

function onGameStart()
{
    mainMenu.style.display = "none"
    chooseTeamsMenu.style.display = "none"
    gameCanvas.style.display = "block"
    gameCanvas.style.display = "block"
}

updateText()