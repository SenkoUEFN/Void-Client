const express = require("express")
const websocket = require("ws")
const path = require("path")
const http = require("http")
const { getGame, getGameFromId } = require("./network/FindGame.js")
const { joinGame } = require("./network/JoinGame.js")
const app = express()
const server = http.createServer(app)
const wss = new websocket.WebSocketServer({server})
const port = 9000

const playerInfo = 
{
    name : "Void CLient Test",
    shipColor : 67
}


app.use(express.static(path.join(__dirname, "../public")))

app.get("/", (req, res) => 
{
    res.sendFile(path.join(__dirname, "../public/html/index.html"))
})

server.listen(port, () =>
{
    console.log("Server running on : ", `http://localhost:${port}`)
})

wss.on("connection", (socket) =>
{
    socket.on("message", (message) =>
    {
        let msg = JSON.parse(message.toString())
        console.log(msg)
        if(msg.name === "play")
        {
            if(msg.mode === "team")
            {
                socket.send(JSON.stringify(
                {
                    name : "chooseTeam"
                }
                ))
                return
            }
            StartGame(msg.mode, "", null, socket)
        }
        else if(msg.name === "customGame")
        {
            StartGame("", `${msg.link}`, null, socket)
        }
        if(msg.name === "canStart")
        {
            StartGame(msg.mode, "", msg.data.teamNumber, socket)
        }

    })
})

async function StartGame(mode, link, teamNumber, socket)
{
    console.log(mode)
    if(link === "")
    {
        serverSystem = await getGame(mode)
        if(!serverSystem)
        {
            console.log("no game found")
            return
        }
        if(serverSystem.mode === "team")
        {
            joinGame(serverSystem, playerInfo, teamNumber)
        }
        else
        {
            joinGame(serverSystem, playerInfo)
        }
    }
    else
    {
        console.log("custom game")
        const gameInfo = await getGameFromId(link)
        if(!gameInfo)
        {
            return
        }
        joinGame(gameInfo, playerInfo)
    }
    startRendering(socket)
}

function startRendering(socket)
{
    socket.send(JSON.stringify(
        {
            name : "gameStart"
        }
    ))
}



