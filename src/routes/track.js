const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

app.use(cors());

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Listen for location updates from client
    socket.on('send-location', (data) => {
        console.log('Location received:', data);
        // Broadcast to all clients except the sender
        socket.broadcast.emit('update-location', { id: socket.id, ...data });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        io.emit('remove-marker', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
