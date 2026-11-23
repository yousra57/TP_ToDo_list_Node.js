// Démarrage et configuration Express

// constantes
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const express = require("express");
const app = express();
const PORT = 3000;
const tasksRouter = require("./routes/tasks.routes");

app.use(express.json());
app.use(express.static('public'));


app.get("/", (req, res) => {
    res.json({ message: "API ToDo opérationnelle" });
});


app.use("/tasks", tasksRouter);

const server = http.createServer(app);
// On créer les WebSocketServer en utilisant le serveur HTTP existant
const wss = new WebSocketServer({ server });

require('./tempsReel').definirServeurWebSocket(wss);

function signalerChangementTaches() {
  const message = JSON.stringify({ type: 'tasks:changed' });
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

wss.on('connection', (socket) => {
  console.log('Un navigateur est connecté');
  socket.on('close', () => console.log('Navigateur déconnecté'));
});

server.listen(3000, () => {
  console.log('API + WebSocket sur http://localhost:3000');
});