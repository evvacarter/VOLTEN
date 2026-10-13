// 1. MOBILE MENU LOGIC
const menuBtn = document.getElementById('menuBtn');
const menuIcon = document.getElementById('menuIcon');
const mobileOverlay = document.getElementById('mobileOverlay');

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        mobileOverlay.classList.toggle('active');
        if (mobileOverlay.classList.contains('active')) {
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-xmark'); 
        } else {
            menuIcon.classList.remove('fa-xmark');
            menuIcon.classList.add('fa-bars');  
        }
    });
}
// 1. HERO SECTION ANIMATION ( ON PAGE LOAD)
window.addEventListener('DOMContentLoaded', () => {
    const heroSectionTarget = document.querySelector('.hero-section');
    if (heroSectionTarget) {
        setTimeout(() => {
            heroSectionTarget.classList.add('show-on-scroll');
        }, 100);
    }
});
// 2. SCROLL REVEAL ANIMATION (QUIZ)
const quizSection = document.getElementById('quizSection');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show-on-scroll');
        }
    });
}, { threshold: 0.2 });
if (quizSection) observer.observe(quizSection);

// 3. IDLE ANIMATION LOGIC
const idleCanvas = document.getElementById('idleCanvas');
const idleCtx = idleCanvas ? idleCanvas.getContext('2d') : null;
let idleBall = { x: 200, y: 100, dx: 3, dy: 2, radius: 15 };
let isGameActive = false;

function drawIdleAnimation(){
    if (!idleCtx) return;
    if (isGameActive) return; 
    idleCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    idleCtx.fillRect(0, 0, idleCanvas.width, idleCanvas.height);
    
    idleCtx.beginPath();
    idleCtx.arc(idleBall.x, idleBall.y, idleBall.radius, 0, Math.PI * 2);
    idleCtx.fillStyle = '#39ff14';
    idleCtx.shadowBlur = 20;
    idleCtx.shadowColor = '#39ff14';
    idleCtx.fill();
    idleCtx.closePath();

    idleBall.x += idleBall.dx;
    idleBall.y += idleBall.dy;
    
    if (idleBall.x + idleBall.dx > idleCanvas.width - idleBall.radius || idleBall.x + idleBall.dx < idleBall.radius) idleBall.dx = -idleBall.dx;
    if (idleBall.y + idleBall.dy > idleCanvas.height - idleBall.radius || idleBall.y + idleBall.dy < idleBall.radius) idleBall.dy = -idleBall.dy;
    
    requestAnimationFrame(drawIdleAnimation);
}
if (idleCanvas) drawIdleAnimation();

// 4. GAME TRIGGER & EXIT LOGIC
const gameIntro = document.getElementById('gameIntro');
const fullGameContainer = document.getElementById('fullGameContainer');
const navbar = document.querySelector('.navbar');

if (gameIntro) {
    gameIntro.addEventListener('click', () => {
        isGameActive = true;
        if (fullGameContainer) fullGameContainer.style.display = 'flex';
        
        if (navbar) navbar.style.display = 'none';
        if (quizSection) quizSection.style.display = 'none';
        
        startGame();
    });
}

// Exit ko global banana zaroori hai HTML onclick ke liye
window.exitGame = function() {
    isGameActive = false;
    if (fullGameContainer) fullGameContainer.style.display = 'none';
    if (navbar) navbar.style.display = 'flex';
    if (quizSection) quizSection.style.display = 'flex';
    
    // Yahan Modal ko close karte hain chahe uski id kuch bhi ho
    let modal = document.getElementById('gameOverModal') || document.getElementById('gameOver');
    if (modal) modal.style.display = 'none';
    
    if (idleCanvas) drawIdleAnimation();
}

// 5. ACTUAL TENNIS GAME LOGIC
const gameCanvas = document.getElementById('activeGameCanvas');
const gCtx = gameCanvas ? gameCanvas.getContext('2d') : null;
let gameLoop;

let player = { x: 730, y: 200, width: 20, height: 100, score: 0 };
let bot = { x: 50, y: 200, width: 20, height: 100, score: 0, speed: 4 };
let activeBall = { x: 400, y: 250, radius: 12, speed: 4, dx: 4, dy: 4 };

let isGameOver = false;
const WINNING_SCORE = 5; 

function movePlayer(clientX, clientY) {
    if(isGameOver || !gameCanvas) return;
    
    let rect = gameCanvas.getBoundingClientRect();
    let scaleX = gameCanvas.width / rect.width;
    let scaleY = gameCanvas.height / rect.height;

    let newX = (clientX - rect.left) * scaleX;
    let newY = (clientY - rect.top) * scaleY;

    if(newX < gameCanvas.width / 2 + 20) newX = gameCanvas.width / 2 + 20;
    if(newX > gameCanvas.width - 30) newX = gameCanvas.width - 30;

    player.x = newX;
    player.y = newY - player.height / 2;
}

if (gameCanvas) {
    gameCanvas.addEventListener('mousemove', (e) => {
        movePlayer(e.clientX, e.clientY);
    });

    gameCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault(); 
        movePlayer(e.touches[0].clientX, e.touches[0].clientY);
    }, {passive: false});

    gameCanvas.addEventListener('click', () => {
        if(isGameOver) startGame();
    });
}

function drawFullGame() {
    if(!isGameActive || isGameOver || !gCtx) return;

    gCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    gCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    gCtx.strokeStyle = 'rgba(57, 255, 20, 0.3)';
    gCtx.setLineDash([10, 15]);
    gCtx.beginPath();
    gCtx.moveTo(gameCanvas.width/2, 0);
    gCtx.lineTo(gameCanvas.width/2, gameCanvas.height);
    gCtx.stroke();
    gCtx.setLineDash([]);

    gCtx.shadowBlur = 15;
    gCtx.shadowColor = '#39ff14';
    gCtx.beginPath();
    gCtx.arc(activeBall.x, activeBall.y, activeBall.radius, 0, Math.PI * 2);
    gCtx.fillStyle = '#39ff14';
    gCtx.fill();
    gCtx.closePath();

    gCtx.fillStyle = '#fff';
    gCtx.shadowBlur = 5;
    gCtx.shadowColor = '#fff';
    gCtx.font = "bold 80px monospace";
    gCtx.fillText("[", player.x, player.y + player.height/1.5);

    gCtx.fillStyle = '#ff3333'; 
    gCtx.shadowColor = '#ff3333';
    gCtx.fillText("]", bot.x, bot.y + bot.height/1.5);

    activeBall.x += activeBall.dx;
    activeBall.y += activeBall.dy;

    if (activeBall.y - activeBall.radius < 0 || activeBall.y + activeBall.radius > gameCanvas.height) {
        activeBall.dy = -activeBall.dy;
    }

    let botCenter = bot.y + bot.height/2;
    bot.y += (activeBall.y - botCenter) * 0.12; 
    if(bot.y < 0) bot.y = 0;
    if(bot.y + bot.height > gameCanvas.height) bot.y = gameCanvas.height - bot.height;

    // Player Paddle Hit
    if (activeBall.x + activeBall.radius >= player.x && 
        activeBall.x - activeBall.radius <= player.x + 20 && 
        activeBall.y >= player.y && 
        activeBall.y <= player.y + player.height && 
        activeBall.dx > 0) { 
        
        activeBall.dx = -activeBall.dx;
        activeBall.dx *= 1.05;
        activeBall.dy *= 1.05;
    }
    
    // Bot Paddle Hit
    if (activeBall.x - activeBall.radius <= bot.x + 20 && 
        activeBall.x + activeBall.radius >= bot.x && 
        activeBall.y >= bot.y && 
        activeBall.y <= bot.y + bot.height && 
        activeBall.dx < 0) {
        
        activeBall.dx = -activeBall.dx;
        activeBall.dx *= 1.05; 
        activeBall.dy *= 1.05;
    } 

    if (activeBall.x < 0) {
        player.score++;
        checkWin();
    } else if (activeBall.x > gameCanvas.width) {
        bot.score++;
        checkWin();
    }

    let pScore = document.getElementById('playerScore');
    let bScore = document.getElementById('botScore');
    if(pScore) pScore.innerText = player.score;
    if(bScore) bScore.innerText = bot.score;

    gameLoop = requestAnimationFrame(drawFullGame);
}

function checkWin() {
    if(player.score >= WINNING_SCORE || bot.score >= WINNING_SCORE) {
        isGameOver = true;
        
        let winnerText = player.score >= WINNING_SCORE ? "YOU WIN! 🎉" : "BOT WINS! 💀";
        let titleElement = document.getElementById('winnerText');
        
        if (titleElement) {
            titleElement.innerText = winnerText;
            if (player.score >= WINNING_SCORE) {
                titleElement.style.color = "var(--neon-green)";
                titleElement.style.textShadow = "0 0 15px var(--neon-green)";
            } else {
                titleElement.style.color = "var(--neon-red)";
                titleElement.style.textShadow = "0 0 15px var(--neon-red)";
            }
        }
        
        // Dono IDs check karega taaki Error/Crash na aaye
        let modal = document.getElementById('gameOverModal') || document.getElementById('gameOver');
        if (modal) modal.style.display = 'block';
        
    } else {
        resetBall();
    }
}

function resetBall() {
    if(!gameCanvas) return;
    activeBall.x = gameCanvas.width / 2;
    activeBall.y = gameCanvas.height / 2;
    
    let directionX = Math.random() > 0.5 ? 4 : -4;
    let directionY = Math.random() > 0.5 ? 4 : -4;
    
    activeBall.dx = directionX;
    activeBall.dy = directionY;
}

window.startGame = function() {
    isGameOver = false;
    player.score = 0;
    bot.score = 0;
    
    let pScore = document.getElementById('playerScore');
    let bScore = document.getElementById('botScore');
    if(pScore) pScore.innerText = player.score;
    if(bScore) bScore.innerText = bot.score;
    
    // Dono IDs check karega Modal chhupane ke liye
    let modal = document.getElementById('gameOverModal') || document.getElementById('gameOver');
    if(modal) modal.style.display = 'none';
    
    resetBall();
    drawFullGame();
}