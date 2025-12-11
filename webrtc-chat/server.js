const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 }); // WebSocket sunucusu, port 8080'de çalışacak

// WebSocket bağlantısı kurulduğunda
wss.on('connection', (ws) => {
    console.log('Yeni bir kullanıcı bağlandı.');

    // Mesaj alındığında
    ws.on('message', (message) => {
        console.log('Mesaj alındı:', message);

        // Gelen mesajı tüm bağlı kullanıcılara ilet
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message); // Mesajı diğer kullanıcılara ilet
            }
        });
    });

    // Bağlantı kapandığında
    ws.on('close', () => {
        console.log('Bir kullanıcı ayrıldı.');
    });
});

console.log('WebSocket sunucusu çalışıyor...');
