// Servidor de Sinalização para Espelhamento de Tela
const express = require('express');
const app = express();
const http = require('http').createServer(app);

// Configura o Socket.io para permitir conexões de qualquer site (CORS)
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Quando um dispositivo se conecta ao servidor
io.on('connection', (socket) => {
    console.log('Um dispositivo conectou: ' + socket.id);

    // Entrar em uma sala específica pelo ID do link
    socket.on('entrar-na-sala', (salaId) => {
        socket.join(salaId);
        console.log(`Dispositivo ${socket.id} entrou na sala: ${salaId}`);
        
        // Avisa os outros na sala que um novo usuário chegou
        socket.to(salaId).emit('novo-usuario', socket.id);
    });

    // Repassa as mensagens do WebRTC (as configurações de vídeo) entre os dispositivos
    socket.on('mensagem-sinalizacao', (dados) => {
        // Envia os dados direto para a sala correta, sem salvar nada no servidor
        socket.to(dados.salaId).emit('mensagem-sinalizacao', dados);
    });

    // Quando o usuário fecha o site
    socket.on('disconnect', () => {
        console.log('Dispositivo desconectou: ' + socket.id);
    });
});

// O servidor vai rodar na porta automática do serviço de hospedagem ou na 3000 localmente
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Servidor de sinalização rodando na porta ${PORT}`);
});
