const WebSockets = require("ws")


async function getGame(mode)
{
    const res = await fetch("https://starblast.io/simstatus.json")
    const serverData = await res.json()
    const server = await getBestServer(serverData)
    console.log("server", server)
    for(serv of serverData)
    {
        if(serv.address === server.ip && serv.systems.length !== 0)
        {
            console.log("found server")
            for(game of serv.systems)
            {
                if(game.mode === mode)
                {
                    return {
                        wsUrl : server.wsUrl,
                        gameId : game.id,
                        mode : game.mode
                    }
                }
            }
        }
    }
}

async function getBestServer(serverData)
{
    let servers = []
    for(server of serverData)
    {
        if(server.systems.length !== 0)
        {
            servers.push(await pingServer(server))
        }
    }
    
    const bestServer = getLessPingServer(servers)
    return servers[bestServer]
}

function getLessPingServer(serversData)
{
    let indexMinimum = 0
    for(let i = 0; i < serversData.length ; i++)
    {
        if(serversData[indexMinimum].ping > serversData[i].ping)
        {
            indexMinimum = i
        }
    }
    return indexMinimum
}

function pingServer(server)
{
    return new Promise((resolve,reject) =>
    {
        let dateSend = 0
        let dateReceived = 0
        const wsUrl = buildWsUrl(`${server.address}`)
        const socket = new WebSockets(
            wsUrl,
            {
                headers : 
                {
                    Origin : "starblast.io"
                }
            }
        )
        socket.on("open", () => 
        {
            dateSend = Date.now()
            socket.send("ping")
        })
        socket.on("message", (message) =>
        {
            if(message.toString() === "pong")
            {
                dateReceived = Date.now()
                socket.close()
                resolve({
                    ip : server.address,
                    wsUrl : wsUrl,
                    ping : dateReceived - dateSend
                    })
            }
        })
    })
    
}
function buildWsUrl(address) 
{
    let validAdress = address.toString()
    
    const [ip, port] = address.split(":")
    const hostname = ip.split(".").join("-")
    return `wss://${hostname}.starblast.io:${port}/`
}

async function getGameFromId(gameLink)
{
    console.log(gameLink)
    if(gameLink.includes("@"))
    {
        return moddedCustomParty(gameLink)
    }
    else
    {
        return vanillaCustomParty(gameLink)
    }
}

function moddedCustomParty(gameLink)
{
    let wsServerUrl = ""
    let gameId = ""
    if(gameLink.includes("@"))
    {
        serverIp = gameLink.split("@")[1]
        wsServerUrl = buildWsUrl(serverIp)
        gameId = `${gameLink.split("@")[0]}`
        gameId = gameId.split("#")[1]
        console.log(wsServerUrl)
        console.log(typeof(gameId))

    }
    return{
        id : parseInt(gameId),
        wsUrl : wsServerUrl
    }
    

    return null
}

async function vanillaCustomParty(gameLink)
{
    let wsServerUrl = ""
    let gameId = gameLink.split("#")[1]
    const res = await fetch("https://starblast.io/simstatus.json")
    const serverData = await res.json()
    
    for(server of serverData)
    {
        if(server.systems !== 0)
        {
            for(game of server.systems)
            {
                if(gameId === (game.id).toString())
                {
                    return{
                        id : game.id,
                        mode : game.mode,
                        wsUrl : buildWsUrl(server.address)
                    }
                }
            }
        }
    }
    return null
}

module.exports = { getGame, getGameFromId }