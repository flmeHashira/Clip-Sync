const express = require('express');
const app = express();
const http = require('http').createServer(app);

let Nusers = 0;

const PORT = 3000;

http.listen(PORT, () => {
    console.log(`Listening to ${PORT}`);
});

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/Main.html');
});
app.get('/t', (req, res) => {
    res.json({ Name: "Gourav", Title: "Jha" });
})
const io = require('socket.io')(http);
io.on('connection', (socket) => {
    Nusers++;
    console.log(`${Nusers} user(s) connected Last Updated:`);
    socket.on('disconnect', () => {
        Nusers--;
        console.log(`${Nusers} user(s) connected..`);
    });
    socket.on('message', (msg) => {
        socket.broadcast.emit('message', msg);
    })
})