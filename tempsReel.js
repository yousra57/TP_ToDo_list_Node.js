let wss;

function definirServeurWebSocket(instance) { wss = instance; }

function signalerChangementTaches() {
  if (!wss) return;
  const { WebSocket } = require('ws');
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'tasks:changed' }));
    }
  }
}

module.exports = { definirServeurWebSocket, signalerChangementTaches };