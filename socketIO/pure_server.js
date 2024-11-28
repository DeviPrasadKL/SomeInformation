import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
    }
});

// Basic route
app.get('/', (req, res) => {
    res.send('Chat application is running!');
});

// Socket.io setup
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);


    socket.on("join_room", ({ room, username }) => {
        socket.join(room);
        console.log(`${username} joined room: ${room}`);
    });

    socket.on("leave_room", ({ room, username }) => {
        socket.leave(room);
        console.log(`${username} Left room: ${room}`);
    });

    socket.on("sendMessage", (data) => {
            socket.to(data.room).emit("receive_message", {
                msg: data.msg,
                room: data.room,
            });
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
