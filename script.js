const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 30; // Tamanho de cada quadrado no mapa
const rows = canvas.height / gridSize; // Número de linhas
const cols = canvas.width / gridSize; // Número de colunas

// Propriedades do jogador
let player = {
    x: Math.floor(cols / 2),
    y: Math.floor(rows / 2),
    width: gridSize / 2,
    height: gridSize / 2,
    weapon: 0 // Índice da arma atual
};

// Definição das armas
const weapons = [
    { name: 'Pistola', damage: 1 },
    { name: 'Metralhadora', damage: 2 },
    { name: 'Shotgun', damage: 3 },
    { name: 'Rifle', damage: 4 },
];

let enemies = [];
let timer = 0; // Tempo em segundos
let keys = {};
let bullets = []; // Array para armazenar os tiros
let gameOver = false; // Flag para verificar se o jogo acabou
let timerInterval; // Intervalo para o timer

// Função para iniciar o jogo
function startGame() {
    document.getElementById('gameOver').classList.add('hidden');
    timer = 0; // Reinicia o timer
    enemies = [];
    bullets = []; // Reinicia os tiros
    gameOver = false; // Reinicia o estado do jogo

    // Inicia o timer
    timerInterval = setInterval(() => {
        if (!gameOver) timer += 0.1; // Aumenta o timer enquanto o jogo está ativo
    }, 100); // Atualiza o timer a cada 100ms

    spawnEnemies(); // Começa a gerar inimigos
    gameLoop();
}

// Função para a lógica do jogo
function gameLoop() {
    if (gameOver) {
        clearInterval(timerInterval); // Para o timer se o jogo acabar
        return; // Para o loop se o jogo estiver acabado
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawPlayer();
    drawEnemies();
    drawBullets(); // Desenha os tiros
    drawTimer(); // Desenha o timer

    // Movimentação contínua com W, A, S, D
    if (keys['KeyW'] && player.y > 0) {
        player.y -= 0.1; // Mover para cima (reduzido)
    }
    if (keys['KeyS'] && player.y < rows - 1) {
        player.y += 0.1; // Mover para baixo (reduzido)
    }
    if (keys['KeyA'] && player.x > 0) {
        player.x -= 0.1; // Mover para a esquerda (reduzido)
    }
    if (keys['KeyD'] && player.x < cols - 1) {
        player.x += 0.1; // Mover para a direita (reduzido)
    }

    updateBullets(); // Atualiza a posição dos tiros
    updateEnemies(); // Atualiza a posição dos inimigos

    // Verifica se o jogador colidiu com um inimigo
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

// Função para desenhar o jogador
function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x * gridSize, player.y * gridSize, player.width, player.height);
    // Mostra a arma atual
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillText(`Arma: ${weapons[player.weapon].name}`, player.x * gridSize, player.y * gridSize - 10);
}

// Função para desenhar inimigos
function drawEnemies() {
    enemies.forEach((enemy) => {
        ctx.fillStyle = enemy.color; // Cor dos inimigos
        ctx.fillRect(enemy.x * gridSize, enemy.y * gridSize, gridSize / 1.5, gridSize / 1.5); // Tamanho do inimigo
    });
}

// Função para desenhar os tiros
function drawBullets() {
    ctx.fillStyle = 'yellow'; // Cor do tiro
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x * gridSize, bullet.y * gridSize, gridSize / 4, gridSize / 4);
    });
}

// Função para desenhar o timer
function drawTimer() {
    ctx.fillStyle = 'black'; // Cor do texto
    ctx.font = '20px Arial'; // Define a fonte
    ctx.fillText('Tempo: ' + timer.toFixed(1) + 's', 10, 30); // Desenha o timer no canvas
}

// Função para gerar inimigos aleatoriamente
function spawnEnemies() {
    setInterval(() => {
        if (gameOver) return; // Não gera mais inimigos se o jogo estiver acabado
        const enemyType = Math.floor(Math.random() * 4); // Escolhe um tipo de inimigo aleatório
        const enemy = {
            x: Math.random() < 0.5 ? -1 : cols, // Aparece à esquerda ou à direita do canvas
            y: Math.floor(Math.random() * rows),
            speed: 0.1, // Velocidade padrão para inimigos
            health: 1, // Saúde padrão
            color: 'red' // Cor padrão do inimigo
        };

        // Definindo as características de cada tipo de inimigo
        switch (enemyType) {
            case 0: // Inimigo vermelho
                enemy.color = 'red';
                break;
            case 1: // Inimigo verde (mais rápido)
                enemy.color = 'green';
                enemy.speed = 0.2; // Aumenta a velocidade
                break;
            case 2: // Inimigo roxo (mais resistente)
                enemy.color = 'purple';
                enemy.health = 2; // Inimigos roxos têm mais saúde
                break;
            case 3: // Inimigo rosa (troca a arma do jogador)
                enemy.color = 'pink'; // Adiciona cor rosa para identificar
                enemy.health = 1; // Saúde padrão
                break;
        }

        enemies.push(enemy); // Adiciona o inimigo à lista
    }, 1000);
}

// Atualiza a posição dos tiros
function updateBullets() {
    bullets.forEach((bullet, bulletIndex) => {
        bullet.x += bullet.dx * 0.5; // Reduz a velocidade do tiro
        bullet.y += bullet.dy * 0.5; // Reduz a velocidade do tiro

        // Remove a bala se sair do canvas
        if (bullet.x < 0 || bullet.x >= cols || bullet.y < 0 || bullet.y >= rows) {
            bullets.splice(bulletIndex, 1);
        }
    });
}

// Atualiza a posição dos inimigos
function updateEnemies() {
    enemies.forEach(enemy => {
        // Move o inimigo em direção ao jogador
        if (enemy.color !== 'yellow') { // Inimigos amarelos desviam
            if (player.x > enemy.x) enemy.x += enemy.speed;
            if (player.x < enemy.x) enemy.x -= enemy.speed;
            if (player.y > enemy.y) enemy.y += enemy.speed;
            if (player.y < enemy.y) enemy.y -= enemy.speed;
        }
    });
}

// Verifica colisões entre o jogador, os inimigos e as balas
function checkCollisions() {
    // Verifica se o jogador colidiu com algum inimigo
    enemies.forEach((enemy) => {
        if (Math.abs(player.x - enemy.x) < 0.5 && Math.abs(player.y - enemy.y) < 0.5) {
            gameOver = true; // Aciona a condição de game over
            clearInterval(timerInterval); // Para o timer
            document.getElementById('gameOver').classList.remove('hidden'); // Mostra a tela de game over
            return; // Para verificar outras colisões
        }
    });

    // Verifica colisões entre as balas e os inimigos
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (Math.abs(bullet.x - enemy.x) < 0.5 && Math.abs(bullet.y - enemy.y) < 0.5) {
                if (enemy.health > 1) { // Inimigos roxos (mais resistentes)
                    enemy.health--; // Reduz a saúde
                    bullets.splice(bulletIndex, 1); // Remove a bala
                } else {
                    // Troca a arma se o inimigo for rosa
                    if (enemy.color === 'pink') {
                        player.weapon = Math.floor(Math.random() * weapons.length); // Troca a arma
                        console.log(`Arma trocada para: ${weapons[player.weapon].name}`);
                    }

                    enemies.splice(enemyIndex, 1); // Remove o inimigo derrotado
                    bullets.splice(bulletIndex, 1); // Remove a bala
                }
            }
        });
    });
}

// Função para lidar com eventos de teclado
document.addEventListener('keydown', (event) => {
    keys[event.code] = true; // Marca a tecla como pressionada
});

document.addEventListener('keyup', (event) => {
    keys[event.code] = false; // Marca a tecla como não pressionada
});

// Função para disparar a arma
canvas.addEventListener('click', (event) => {
    if (!gameOver) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = (event.clientX - rect.left) / gridSize; // Posição do mouse normalizada
        const mouseY = (event.clientY - rect.top) / gridSize; // Posição do mouse normalizada
        const dx = mouseX - player.x; // Diferença em x
        const dy = mouseY - player.y; // Diferença em y
        const magnitude = Math.sqrt(dx * dx + dy * dy); // Magnitude da direção

        const bullet = {
            x: player.x,
            y: player.y,
            dx: dx / magnitude, // Normaliza para o vetor unitário
            dy: dy / magnitude // Normaliza para o vetor unitário
        };

        bullets.push(bullet); // Adiciona a bala ao array de balas
    }
});

// Inicia o jogo
startGame();
