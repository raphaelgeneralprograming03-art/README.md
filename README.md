# 📺 Sistema de Espelhamento de Tela Síncrono

Este é um sistema de transmissão e espelhamento de telas em tempo real (com latência de milissegundos). Ele funciona diretamente pelo navegador em dispositivos Android, iOS, Linux e macOS com apenas um clique.

## 🛠️ Tecnologias Utilizadas
* **HTML5 & CSS3**: Estrutura e estilização da interface visual.
* **JavaScript (WebRTC)**: Responsável pela captura e transmissão do vídeo ponto a ponto (P2P).
* **Node.js & Socket.io**: Mini servidor de sinalização para conectar os dispositivos na internet.

## 📂 Estrutura do Repositório
* `index.html`: Contém a interface do usuário e o motor WebRTC.
* `server.js`: Código do servidor que faz a ponte inicial entre os aparelhos.
* `package.json`: Configurações e dependências do servidor Node.js.

## 🚀 Como Funciona?
1. O **Transmissor** acessa o link do site e clica em **"Transmitir Minha Tela"**.
2. O sistema gera um link único na tela (ex: `https://seu-site.com`).
3. O Transmissor envia esse link para o **Receptor**.
4. Assim que o Receptor clica no link, a conexão ultra rápida é estabelecida em milissegundos!
