// server.js
// Çalıştırma: npm i express ws
// node server.js

const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Basit demo kullanıcı listesi
const USERS = {
  "alice": "demo123",
  "bob": "demo456"
};

// Bağlantılar
wss.on("connection", (ws) => {
  ws.isAlive = true;
  ws.on("pong", () => (ws.isAlive = true));

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch (e) {
      return;
    }

    // Giriş kontrolü
    if (msg.type === "auth") {
      const { username, password } = msg;
      if (USERS[username] && USERS[username] === password) {
        ws.user = username;
        ws.send(
          JSON.stringify({ type: "auth", ok: true, username })
        );
      } else {
        ws.send(
          JSON.stringify({ type: "auth", ok: false, error: "Invalid credentials" })
        );
      }
      return;
    }

    // Mesaj gönderme
    if (msg.type === "chat") {
      if (!ws.user) {
        ws.send(JSON.stringify({ type: "error", error: "Not authenticated" }));
        return;
      }

      const payload = {
        type: "chat",
        from: ws.user,
        text: String(msg.text || ""),
        ts: Date.now()
      };

      // Herkese gönder
      wss.clients.forEach((c) => {
        if (c.readyState === WebSocket.OPEN) {
          c.send(JSON.stringify(payload));
        }
      });
    }
  });

  ws.on("close", () => {});
});

// Ölü bağlantıları temizleme
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Statik dosya klasörü
app.use(express.static(path.join(__dirname, "public")));

// Sunucu başlat
const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log("Server running on port", PORT)
);
