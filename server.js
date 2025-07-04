// server.js

// 1. Importujemy potrzebne biblioteki
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// 2. Konfigurujemy serwer
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3000; // Możemy użyć dowolnego wolnego portu

// 3. Logika serwera
io.on('connection', (socket) => {
    // Ta funkcja wykonuje się za każdym razem, gdy nowa aplikacja łączy się z serwerem
    console.log(`Nowy użytkownik połączony: ${socket.id}`);

    // Nasłuchujemy na wiadomość typu 'message' od klienta
    socket.on('message', (message) => {
        // Gdy dostaniemy wiadomość, logujemy ją na konsoli serwera
        console.log(`Otrzymano wiadomość od ${socket.id}:`, message);

        // I rozgłaszamy ją do WSZYSTKICH INNYCH połączonych klientów
        socket.broadcast.emit('message', message);
    });

    // Ta funkcja wykonuje się, gdy użytkownik się rozłączy
    socket.on('disconnect', () => {
        console.log(`Użytkownik rozłączony: ${socket.id}`);
    });
});

// 4. Uruchamiamy serwer i nasłuchujemy na połączenia
server.listen(PORT, () => {
    console.log(`Serwer sygnalizacyjny nasłuchuje na porcie ${PORT}`);
    console.log(`Otwórz w przeglądarce http://localhost:${PORT}/ aby sprawdzić, czy działa.`);
});

// Prosta odpowiedź, gdy ktoś wejdzie na adres serwera przez przeglądarkę
app.get('/', (req, res) => {
    res.send('Serwer sygnalizacyjny WebRTC działa!');
});