const WebSockets = require("ws") 

async function joinGame(gameInfo, playerInfo, teamNumber)
{
    const socket = new WebSockets(
        
        gameInfo.wsUrl,
        {
            headers :
            {
                Origin : "https://starblast.io"
            }
        }
    )

    socket.on("open", () =>
    {
        console.log("socket opened")
        socket.send(JSON.stringify(
            {
                name : "ojct:4",
                data :
                {
                    mode : gameInfo.mode,
                    spectate : false,
                    player_name : playerInfo.name,
                    hue : playerInfo.shipColor,
                    preferred : gameInfo.id
                }
            }
        ))
    })
    socket.on("message", (message) =>
    {
        let msg
        try
        {
            msg = JSON.parse(message.toString())
        }
        catch(err)
        {
            return
        }
        if(msg.name === "welcome")
        {
            
            socket.send(JSON.stringify(
                {
                    name : "enter",
                    data : 
                    {
                        spectate : false,
                        team : teamNumber
                    }
                }
            ))
            socket.send(JSON.stringify(
                {
                    name : "respawn"
                }
            ))
        }
    })
}

module.exports = { joinGame }