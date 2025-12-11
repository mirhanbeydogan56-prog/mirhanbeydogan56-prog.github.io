const express = require('express');
const Pusher = require('pusher');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Pusher API Anahtarlarınızı buraya girin
const pusher = new Pusher({
    appId: '2089917', // Pusher app ID
    key: '03a4356cfe7da7f2209', // Pusher Key
    secret: '0b888c0251dd0e0f62a9', // Pusher Secret
    cluster: 'eu', // Pusher Cluster
    useTLS: true
});

// JSON verisini işlemek için body-parser'ı kullanacağız
app.use(bodyParser.json());

// WebRTC sinyalleme işlemleri için Pusher üzerinden sinyal gönderiyoruz

// Teklif gönderme
app.post('/offer', (req, res) => {
    pusher.trigger('webrtc-channel', 'client-offer', {
        offer: req.body.offer
    });
    res.send('Offer gönderildi');
});

// Cevap gönderme
app.post('/answer', (req, res) => {
    pusher.trigger('webrtc-channel', 'client-answer', {
        answer: req.body.answer
    });
    res.send('Answer gönderildi');
});

// ICE candidate gönderme
app.post('/ice-candidate', (req, res) => {
    pusher.trigger('webrtc-channel', 'client-ice-candidate', {
        candidate: req.body.candidate
    });
    res.send('ICE candidate gönderildi');
});

// Public klasörü statik dosya olarak servis et
app.use(express.static('public'));

// Sunucuyu başlatıyoruz
app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor`);
});
