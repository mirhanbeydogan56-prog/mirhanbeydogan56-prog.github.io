const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg);
      const { type, roomId, payload } = data;
      if (!roomId) return;

      switch (type) {
        case 'join': {
          if (!rooms.has(roomId)) rooms.set(roomId, new Set());
          rooms.get(roomId).add(ws);
          ws.roomId = roomId;
          rooms.get(roomId).forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'new-peer' }));
            }
          });
          break;
        }
        case 'signal': {
          const clients = rooms.get(roomId);
          if (!clients) return;
          clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: 'signal', payload }));
            }
          });
          break;
        }
      }
    } catch (e) {
      console.error('Invalid message', e);
    }
  });

  ws.on('close', () => {
    const roomId = ws.roomId;
    if (roomId && rooms.has(roomId)) {
      rooms.get(roomId).delete(ws);
      if (rooms.get(roomId).size === 0) rooms.delete(roomId);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Signaling server listening on ${PORT}`));
