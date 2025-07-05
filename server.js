// server.js - Wersja 2.0

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { // Ważne dla nowszych wersji Socket.IO
        origin: "*",
    }
});
const PORT = 3000;

// NOWOŚĆ: Obiekt do przechowywania mapowania nazwa_użytkownika -> id_gniazda
let users = {};

io.on('connection', (socket) => {
    console.log(`Nowy użytkownik połączony: ${socket.id}`);

    // NOWOŚĆ: Nasłuchujemy na wiadomość 'login' od klienta
    socket.on('login', (username) => {
        console.log(`Użytkownik ${username} zalogował się z ID: ${socket.id}`);
        users[username] = socket.id;
        // Informujemy wszystkich (oprócz nadawcy), że pojawił się nowy użytkownik
        socket.broadcast.emit('user-joined', username);
    });

    // ZMIANA: Przerabiamy obsługę wiadomości
    socket.on('message', (data) => {
        const { target, type, payload } = data;
        console.log(`Przekazywanie wiadomości typu '${type}' do użytkownika: ${target}`);
        
        // Znajdujemy ID gniazda docelowego użytkownika
        const targetSocketId = users[target];
        if (targetSocketId) {
            // Wysyłamy wiadomość tylko do tego jednego, konkretnego użytkownika
            io.to(targetSocketId).emit('message', {
                sender: Object.keys(users).find(key => users[key] === socket.id), // Znajdź nazwę nadawcy
                type: type,
                payload: payload
            });
        }
    });

    socket.on('disconnect', () => {
        // Usuwamy użytkownika z listy po rozłączeniu
        const username = Object.keys(users).find(key => users[key] === socket.id);
        if (username) {
            delete users[username];
            console.log(`Użytkownik ${username} rozłączony. ID: ${socket.id}`);
            io.emit('user-left', username);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Serwer sygnalizacyjny v2.0 nasłuchuje na porcie ${PORT}`);
});