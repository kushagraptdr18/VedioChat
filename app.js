const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

const indexRouter = require('./routes/index-router');

app.use("/", indexRouter);


const http = require('http');
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);

let waitingUser=[]
let room={}

io.on("connection", function(socket){
    
    
    socket.on("joinroom",function(){
        if(waitingUser.length>0){
            let user=waitingUser.shift()
            const roomName = `${socket.id}-${user.id}`
            
            socket.join(roomName);
            user.join(roomName);

            io.to(roomName).emit("joined",roomName)            
        }else{
            waitingUser.push(socket);
        }
        
    })

    socket.on("message", function(data){
        console.log(data);
        
        socket.broadcast.to(data.room).emit("message",data.message);

    })

    socket.on("signalingMessage",function(data){
        socket.broadcast.to(data.room).emit("signalingMessage",data.message)        
    })

    socket.on("startVideoCall",function({room}){

        socket.broadcast.to(room).emit("incomingCall")
    })

    socket.on("acceptCall",function({room}){
        socket.broadcast.to(room).emit("callAccepted")
    })

    socket.on("rejectCall",function({room}){
        socket.broadcast.to(room).emit("callRejected")
    })

    socket.on("disconnect", function(socket){
        let index = waitingUser.findIndex((waitinguser)=> waitinguser.id==socket.id)
        waitingUser.splice(index,1);
    
    
    })
    

})


server.listen(3000, () => {
    console.log('Server running on port 3000');
});