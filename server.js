const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const PORT = 3001;

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
}));

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

let connectedUsers = 0; // Simple user counter

io.on('connection', (socket) => {
    connectedUsers++;
    console.log(`User connected: ${socket.id}. Total users: ${connectedUsers}`);
    
    io.emit('user_count_update', connectedUsers);

    socket.on('send_message', (data) => {
        console.log(`Message received: [${data.user}]: ${data.message}`);

        io.emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        connectedUsers--;
        console.log(`User disconnected: ${socket.id}. Total users: ${connectedUsers}`);
        io.emit('user_count_update', connectedUsers);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});