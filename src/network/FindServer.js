const WebSockets = require("ws")

getBestServer()

async function getBestServer()
{
    let servers = []
    const res = await fetch("https://starblast.io/simstatus.json")
    const serverData = await res.json()
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
    console.log(JSON.stringify(serversData))
    let indexMinimum = 0
    for(let i = 0; i < serversData.length -1; i++)
    {
        if(serversData[indexMinimum].delai > serversData[i].delai)
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
        const wsUrl = buildWsUrl(server.address)
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
                    delai : dateReceived - dateSend
                    })
            }
        })
    })
    
}
function buildWsUrl(address) 
{
    const [ip, port] = address.split(":")
    const hostname = ip.split(".").join("-")
    return `wss://${hostname}.starblast.io:${port}/`
}