'use strict';

const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const redis = require('redis');
const { get_rsocket_conf } = require('./node_utils');

// Get the configuration settings
const { rsocketio_port } = get_rsocket_conf();

// Create an Express app and an HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Create Redis subscriber to connect to port 11000
const subscriber = redis.createClient({ port: 11000, host: '127.0.0.1' });

// Handle Redis connection errors
subscriber.on('error', (err) => {
    console.error('Redis connection error:', err);
});

// Subscribe to Redis channel for Frappe events
subscriber.subscribe('events');

// Listen for messages from Redis and broadcast to all clients
subscriber.on('message', (channel, message) => {
    console.log('Message received from Redis:', channel, message); // Debugging log
    try {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.room) {
            console.log(`Emitting event to room: ${parsedMessage.room}`); // Debugging log
            io.to(parsedMessage.room).emit(parsedMessage.event, parsedMessage.message);
        } else {
            console.log('Emitting event to all clients'); // Debugging log
            io.emit(parsedMessage.event, parsedMessage.message);
        }
    } catch (err) {
        console.error('Error parsing Redis message:', err);
    }
});

// Listen for client connections
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Handle room joining
    socket.on('join_room', (room) => {
        socket.join(room); // Join the room
        console.log(`User joined room: ${room}`);
    });

    // Listen for client-sent events and also from react
    socket.on('send_message_from_guest', (room, message) => {
        console.log(`Message from guest to room ${room}: ${message}`);
        // Emit the message to only the clients in the specified room
        io.to(room).emit('message', message); // Send message to the room
    });

    // Handle client disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Start the server on the configured port
server.listen(rsocketio_port, () => {
    console.log(`Server is running on http://localhost:${rsocketio_port}`);
});
