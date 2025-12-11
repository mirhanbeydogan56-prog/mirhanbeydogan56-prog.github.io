const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3000 });

let rooms = {};

wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    const data = JSON.parse(msg);
    const { type, room, payload } = data;

    if (type === "join") {
      if (!rooms[room]) rooms[room] = [];
      rooms[room].push(ws);
      ws.room = room;

      rooms[room].forEach(c => {
        if (c !== ws) c.send(JSON.stringify({ type: "new-peer" }));
      });
    }

    if (type === "signal") {
      rooms[room].forEach(c => {
        if (c !== ws) c.send(JSON.stringify({ type: "signal", payload }));
      });
    }
  });

  ws.on("close", () => {
    if (ws.room && rooms[ws.room]) {
      rooms[ws.room] = rooms[ws.room].filter(c => c !== ws);
    }
  });
});

console.log("WebSocket Signaling Server running on ws://localhost:3000");
