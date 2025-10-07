
const num_players = 4;
const username: string[] = []
let count:number = 0;

export function resetLobbyState() {
  username.length = 0;
  count = 0;
}
      
export default function home(socket, io, sockets, socket_id, players)
{


    socket.on("username",(myData)=>{
        if (sockets.length <= 2)
        {console.log('Player joined: ', myData);
            username.push(myData)
            sockets.push(socket);
            socket_id.push(socket.id);
            console.log(socket_id)   
            count = count+1;
            console.log("user connected with a socket id", socket.id)
            io.emit('player-joined', count);
            io.emit('username-joined', username);
            console.log("sockets length", sockets.length)

            players[sockets.length-1].socket = socket
            players[sockets.length-1].name = myData
            console.log("Object saved")        
            console.log(players[sockets.length-1].name)


                        

        }
        else if(sockets.length === num_players-1) {
            console.log("last player")
        // socket.on("username",(myData)=>{
            console.log('Player joined: ', myData);
            username.push(myData)
            socket_id.push(socket.id);
            sockets.push(socket);
            console.log(socket_id)        
            count = count+1;
            console.log("user connected with a socket id", socket.id)
            players[3].socket = socket
            players[3].name = myData
            console.log("Object saved")
            console.log(players[3].name)
            console.log('Starting the game... hahaha');  
            io.to(socket_id[3]).emit('start-game', "");  
            io.emit('redirect-all', '');
 
            // io.emit('username-joined', username);
            // io.emit('player-joined', count);
        }   
        else
        {
            socket.disconnect()
        }       

        })


}
