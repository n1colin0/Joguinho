const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 30;
const rows = canvas.height / gridSize;
const cols = canvas.width / gridSize;

// Carregar sons
const gameOverSound = new Audio('sound/gameOver.mp3'); // Ajuste o caminho se necessário

let player = {
    x: Math.floor(cols / 2),
    y: Math.floor(rows / 2),
    width: gridSize / 2,
    height: gridSize / 2,
    nickname: '',
    weapon: 0, // Índice da arma atual
    score: 0
};

const weapons = [
    { name: 'Pistola', damage: 1, speed: 0.5, firePattern: 'single' }
    // Adicione outras armas aqui, se necessário
];

let enemies = [];
let timer = 0;
let keys = {};
let bullets = [];
let gameOver = false;
let timerInterval;

// Função para iniciar o jogo
function startGame() {
    document.getElementById('gameOver').classList.add('hidden');
    timer = 0;
    enemies = [];
    bullets = [];
    gameOver = false;
    player.score = 0;

    // Reposiciona o jogador no centro
    player.x = Math.floor(cols / 2);
    player.y = Math.floor(rows / 2);

    timerInterval = setInterval(() => {
        if (!gameOver) timer += 0.1;
    }, 100);

    spawnEnemies();
    gameLoop();
}

// Função para a lógica do jogo
function gameLoop() {
    if (gameOver) {
        clearInterval(timerInterval);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawPlayer();
    drawEnemies();
    drawBullets();
    drawTimer();
    drawScore();

    // Movimentação do jogador
    if (keys['KeyW'] && player.y > 0) player.y -= 0.1;
    if (keys['KeyS'] && player.y < rows - 1) player.y += 0.1;
    if (keys['KeyA'] && player.x > 0) player.x -= 0.1;
    if (keys['KeyD'] && player.x < cols - 1) player.x += 0.1;

    updateBullets();
    updateEnemies();
    checkCollisions();

    requestAnimationFrame(gameLoop);
}

// Função para desenhar o jogador
function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x * gridSize, player.y * gridSize, player.width, player.height);
    // Removendo as informações do jogador
}

// Função para desenhar inimigos
function drawEnemies() {
    enemies.forEach((enemy) => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x * gridSize, enemy.y * gridSize, gridSize / 1.5, gridSize / 1.5);
    });
}

// Função para desenhar os tiros
function drawBullets() {
    ctx.fillStyle = 'yellow';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x * gridSize, bullet.y * gridSize, gridSize / 4, gridSize / 4);
    });
}

// Função para desenhar o timer
function drawTimer() {
    ctx.fillStyle = 'yellow';
    ctx.font = '20px Arial';
    const text = 'Tempo: ' + timer.toFixed(1) + 's';
    const textWidth = ctx.measureText(text).width;
    ctx.fillText(text, (canvas.width - textWidth) / 2, 30);
}

// Função para desenhar a pontuação
function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${player.score}`, 10, 30);
}

// Função para gerar inimigos
function spawnEnemies() {
    setInterval(() => {
        if (gameOver) return;
        const enemyType = Math.floor(Math.random() * 4);
        const enemy = {
            x: Math.random() < 0.5 ? -1 : cols,
            y: Math.floor(Math.random() * rows),
            speed: 0.1,
            health: 1,
            color: 'red',
            special: false
        };

        switch (enemyType) {
            case 0:
                enemy.color = 'red';
                break;
            case 1:
                enemy.color = 'green';
                enemy.speed = 0.1;
                break;
            case 2:
                enemy.color = 'purple';
                enemy.health = 10;
                break;
        }

        enemies.push(enemy);
    }, 1000);
}

// Atualiza a posição dos tiros
function updateBullets() {
    bullets.forEach((bullet, bulletIndex) => {
        bullet.x += bullet.dx * weapons[player.weapon].speed;
        bullet.y += bullet.dy * weapons[player.weapon].speed;

        if (bullet.x < 0 || bullet.x >= cols || bullet.y < 0 || bullet.y >= rows) {
            bullets.splice(bulletIndex, 1);
        }
    });
}

// Atualiza a posição dos inimigos
function updateEnemies() {
    enemies.forEach(enemy => {
        if (enemy.special) {
            enemy.x += enemy.speed; // Apenas passa pela tela
            if (enemy.x > cols || enemy.x < -1) {
                enemies.splice(enemies.indexOf(enemy), 1);
            }
        } else {
            if (player.x > enemy.x) enemy.x += enemy.speed;
            if (player.x < enemy.x) enemy.x -= enemy.speed;
            if (player.y > enemy.y) enemy.y += enemy.speed;
            if (player.y < enemy.y) enemy.y -= enemy.speed;
        }
    });
}

// Verifica colisões entre jogador, inimigos e balas
function checkCollisions() {
    enemies.forEach((enemy) => {
        if (!enemy.special && Math.abs(player.x - enemy.x) < 0.5 && Math.abs(player.y - enemy.y) < 0.5) {
            gameOver = true;
            clearInterval(timerInterval);
            gameOverSound.play(); // Toca som de Game Over
            document.getElementById('gameOver').classList.remove('hidden');
            return;
        }
    });

    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (Math.abs(bullet.x - enemy.x) < 0.5 && Math.abs(bullet.y - enemy.y) < 0.5) {
                if (enemy.special) {
                    player.weapon = (player.weapon + 1) % weapons.length;
                }
                enemies.splice(enemyIndex, 1);
                bullets.splice(bulletIndex, 1);
                player.score++;
            }
        });
    });
}

// Eventos de controle
document.addEventListener('keydown', (event) => {
    keys[event.code] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

document.addEventListener('click', (event) => {
    const angle = Math.atan2(event.clientY - canvas.offsetTop - player.y * gridSize, event.clientX - canvas.offsetLeft - player.x * gridSize);
    bullets.push({ x: player.x, y: player.y, dx: Math.cos(angle), dy: Math.sin(angle) });
});

// Iniciar o jogo
startGame();
