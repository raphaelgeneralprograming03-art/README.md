<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Espelhamento de Tela em Tempo Real</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <div class="container">
        <h1>Painel de Transmissão Síncrona</h1>
        <p>Compartilhe sua tela em milissegundos entre Android, iOS, Linux e Mac.</p>
        
        <div class="video-container">
            <!-- Onde a tela espelhada será mostrada -->
            <video id="screenVideo" autoplay playsinline muted></video>
        </div>

        <div class="controls">
            <button id="startBtn" class="btn primary">📺 Transmitir Minha Tela</button>
            <button id="connectBtn" class="btn secondary">🔗 Conectar ao Link</button>
        </div>
    </div>

    <!-- Script com a lógica do WebRTC -->
    <script src="app.js"></script>
</body>
</html>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
    background-color: #0f172a;
    color: #f8fafc;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
}

.container {
    text-align: center;
    max-width: 800px;
    width: 100%;
}

h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    color: #38bdf8;
}

p {
    color: #94a3b8;
    margin-bottom: 30px;
}

.video-container {
    background-color: #1e293b;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
    aspect-ratio: 16 / 9;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 25px;
    border: 2px solid #334155;
}

video {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.controls {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
}

.btn {
    padding: 12px 24px;
    font-size: 1rem;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn.primary {
    background-color: #0284c7;
    color: white;
}

.btn.primary:hover {
    background-color: #0369a1;
}

.btn.secondary {
    background-color: #475569;
    color: white;
}

.btn.secondary:hover {
    background-color: #334155;
}
const videoElement = document.getElementById('screenVideo');
const startBtn = document.getElementById('startBtn');
const connectBtn = document.getElementById('connectBtn');

let localStream;
let peerConnection;

// Configuração padrão de servidores STUN (ajuda a furar o bloqueio de rede/roteador)
const config = {
    iceServers: [
        { urls: 'stun:://google.com' }
    ]
};

// 1. Capturar a tela do dispositivo (Transmissor)
async function startCapture() {
    try {
        // Solicita a captura de tela nativa do sistema operacional (Android, Mac, Linux, Windows)
        // Nota: No iOS, o espelhamento de tela via navegador tem restrições da Apple; funciona melhor para receber.
        localStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                displaySurface: "monitor",
                cursor: "always"
            },
            audio: false
        });
        
        videoElement.srcObject = localStream;
        console.log("Captura de tela iniciada com sucesso!");
        
        setupPeer();
    } catch (error) {
        console.error("Erro ao capturar tela: ", error);
        alert("Não foi possível capturar a tela. Verifique as permissões do seu navegador.");
    }
}

// 2. Configurar a conexão WebRTC para transmissão em milissegundos
function setupPeer() {
    peerConnection = new RTCPeerConnection(config);
    
    // Adiciona o fluxo de vídeo da tela na conexão em tempo real
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    
    // Configura o recebimento do vídeo no outro lado
    peerConnection.ontrack = (event) => {
        if (!videoElement.srcObject) {
            videoElement.srcObject = event.streams[0];
        }
    };
    
    console.log("Conexão WebRTC preparada.");
    // Aqui você integraria com o seu servidor de sinalização (ex: WebSocket/Socket.io)
    // para trocar os convites de conexão entre os usuários através do link clicado.
}

// Ouvintes dos botões
startBtn.addEventListener('click', startCapture);
connectBtn.addEventListener('click', () => {
    alert("Pronto para conectar! Para funcionar em produção, associe este clique a uma sala do Socket.io usando o ID do link.");
});
