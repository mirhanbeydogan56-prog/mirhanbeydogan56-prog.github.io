// server.js
// Çalıştırma: npm i express ws
// node server.js


const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });


// Basit, bellek içi "kullanıcı veritabanı" — gerçek kullanım için güvenli bir DB ve şifreleme (bcrypt) kullanın.
const USERS = {
"alice": "demo123", // demo kullanıcılar — gerçek parolalarınızı koymayın
"bob": "demo456"
};


// Bağlı istemciler: her soket.user ile ilişkilendirilecek
wss.on('connection', (ws) => {
ws.isAlive = true;
ws.on('pong', () => ws.isAlive = true);


ws.on('message', (raw) => {
let msg;
try { msg = JSON.parse(raw); } catch(e) { return; }


if (msg.type === 'auth') {
const { username, password } = msg;
if (USERS[username] && USERS[username] === password) {
ws.user = username;
ws.send(JSON.stringify({ type: 'auth', ok: true, username }));
// Kullanıcı bağlandığında geçmiş mesajlar yok — basit demo.
} else {
ws.send(JSON.stringify({ type: 'auth', ok: false, error: 'Invalid credentials' }));
}
return;
}


if (msg.type === 'chat') {
if (!ws.user) {
ws.send(JSON.stringify({ type: 'error', error: 'Not authenticated' }));
return;
}
const payload = {
type: 'chat',
from: ws.user,
text: String(msg.text || ''),
ts: Date.now()
};
// Broadcast to all connected clients
wss.clients.forEach((c) => {
if (c.readyState === WebSocket.OPEN) c.send(JSON.stringify(payload));
});
}
});


ws.on('close', () => {});
});


// Basit ping to temiz bağlantılar
setInterval(() => {
wss.clients.forEach((ws) => {
if (!ws.isAlive) return ws.terminate();
ws.isAlive = false;
ws.ping(null, false, true);
});
}, 30000);


// Statik dosyaları servis et
app.use(express.static(path.join(__dirname, 'public')));


// Eğer book.html'i kök dizine koymayacaksanız, aşağıdaki satırı kullanmayın.
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'book.html')));


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server running on port', PORT));
