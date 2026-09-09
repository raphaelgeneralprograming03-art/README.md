const express = require('express');
const app = express();
const http = require('http').createServer(app);

// Configura o canal de comunicação em tempo real (Socket.io)
const io = require('socket.io')(http, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// 🌐 AQUI ESTÁ A UNIFICAÇÃO: O servidor entrega o HTML, CSS e JS direto na tela do usuário
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Espelhamento de Tela Ultra Rápido</title>
    
    <!-- 🎨 CÓDIGO CSS (VISUAL) -->
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Segoe UI', sans-serif; }
        body { background-color: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
        .container { text-align: center; max-width: 800px; width: 100%; }
        h1 { font-size: 2.2rem; margin-bottom: 10px; color: #38bdf8; }
        p { color: #94a3b8; margin-bottom: 20px; }
        .link-box { background: #1e293b; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px dashed #38bdf8; display: none; }
        .link-text { color: #38bdf8; font-weight: bold; word-break: break-all; margin-top: 5px; }
        .video-container { background-color: #1e293b; border-radius: 12px; overflow: hidden; aspect-ratio: 16 / 9; display: flex; align-items: center; justify-content: center; margin-bottom: 25px; border: 2px solid #334155; }
        video { width: 100%; height: 100%; object-fit: contain; }
        .btn { padding: 12px 24px; font-size: 1rem; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; background-color: #0284c7; color: white; transition: 0.2s; }
        .btn:hover { background-color: #0369a1; }
        .status { margin-top: 15px; color: #10b981; font-weight: 500; }
    </style>

    <!-- BIBLIOTECA DE CONEXÃO -->
    <script src="/socket.io/socket.io.js"></script>
</head>
<body>

    <!-- 🌐 CÓDIGO HTML (ESTRUTURA) -->
    <div class="container">
        <h1>Painel de Transmissão Síncrona</h1>
        <p>Compartilhe sua tela em milissegundos entre Android, iOS, Linux e Mac.</p>
        
        <div id="linkBox" class="link-box">
            <span>Envie este link para quem vai assistir:</span>
            <div id="shareLink" class="link-text">Gerando link...</div>
        </div>

        <div class="video-container">
            <video id="screenVideo" autoplay playsinline muted></video>
        </div>

        <div class="controls">
            <button id="startBtn" class="btn">📺 Transmitir Minha Tela</button>
        </div>
        
        <div id="statusText" class="status">Conectando ao sistema...</div>
    </div>

    <!-- ⚙️ CÓDIGO JAVASCRIPT (LÓGICA DO WEBRTC) -->
    <script>
        const socket = io(); // Conecta automaticamente no mesmo link do servidor
        const videoElement = document.getElementById('screenVideo');
        const startBtn = document.getElementById('startBtn');
        const linkBox = document.getElementById('linkBox');
        const shareLink = document.getElementById('shareLink');
        const statusText = document.getElementById('statusText');

        let localStream;
        let peerConnection;
        
        const urlParams = new URLSearchParams(window.location.search);
        let salaId = urlParams.get('sala');
        
        if (!salaId) {
            salaId = Math.random().toString(36).substring(2, 9);
            window.history.replaceState({}, '', \`?sala=\${salaId}\`);
        }

        const config = { iceServers: [{ urls: 'stun:://google.com' }] };

        socket.on('connect', () => {
            statusText.innerText = "Conectado! Pronto para parear.";
            socket.emit('entrar-na-sala', salaId);
            shareLink.innerText = window.location.href;
            linkBox.style.display = "block";
        });

        startBtn.addEventListener('click', async () => {
            try {
                localStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
                videoElement.srcObject = localStream;
                statusText.innerText = "Transmitindo! Aguardando o receptor abrir o link...";
                
                criarPeerConnection();
                localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
                
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);
                socket.emit('mensagem-sinalizacao', { salaId, sdp: peerConnection.localDescription });
            } catch (err) {
                alert("Erro ao compartilhar tela. Lembre-se que iOS só pode assistir.");
            }
        });

        function criarPeerConnection() {
            peerConnection = new RTCPeerConnection(config);

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('mensagem-sinalizacao', { salaId, candidate: event.candidate });
                }
            };

            peerConnection.ontrack = (event) => {
                videoElement.srcObject = event.streams[0];
                statusText.innerText = "Transmissão conectada ao vivo!";
            };
        }

        socket.on('mensagem-sinalizacao', async (dados) => {
            if (!peerConnection) criarPeerConnection();

            if (dados.sdp && dados.sdp.type === 'offer') {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(dados.sdp));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                socket.emit('mensagem-sinalizacao', { salaId, sdp: peerConnection.localDescription });
                statusText.innerText = "Conectando ao transmissor...";
            } 
            else if (dados.sdp && dados.sdp.type === 'answer') {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(dados.sdp));
            } 
            else if (dados.candidate) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(dados.candidate));
            }
        });
    </script>
</body>
</html>
    `);
});

// 📡 LÓGICA DO SERVIDOR DE SINALIZAÇÃO
io.on('connection', (socket) => {
    socket.on('entrar-na-sala', (salaId) => {
        socket.join(salaId);
        socket.to(salaId).emit('novo-usuario', socket.id);
    });

    socket.on('mensagem-sinalizacao', (dados) => {
        socket.to(dados.salaId).emit('mensagem-sinalizacao', dados);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Sistema rodando na porta ${PORT}`);
});
