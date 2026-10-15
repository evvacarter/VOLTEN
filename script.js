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
const thirdPageSection = document.querySelector('.third-page');
if (thirdPageSection) observer.observe(thirdPageSection);
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

let isMobile = window.innerWidth <= 768;

// Players and Ball initial un-sized objects (Size aage set hogi)
let player = { x: 0, y: 0, width: 0, height: 0, score: 0 };
let bot = { x: 0, y: 0, width: 0, height: 0, score: 0 };
let activeBall = { x: 0, y: 0, radius: 12, dx: 0, dy: 0 };

let isGameOver = false;
let isBallPaused = false;
let baseSpeed = 5; // Start thoda theek speed se hoga
let maxSpeed = 11; // Ball is speed se zyada tez nahi hogi (Flow maintain rahega)
const WINNING_SCORE = 5; 

// NAYA FUNCTION: Canvas ko Mobile/Desktop ke hisaab se Adaptive banana
function adjustGameLayout() {
    if (!gameCanvas) return;
    isMobile = window.innerWidth <= 600; 

    
    if (isMobile) {
        // MOBILE (Vertical Adaptive Layout) - Screen ki height lega
        gameCanvas.width = window.innerWidth * 0.95;
        gameCanvas.height = window.innerHeight - 140; // Screen ki 75% height lega
        
        player.width = 110; player.height = 12;
        bot.width = 110; bot.height = 12;
        
        // Initial Positions
        bot.x = (gameCanvas.width / 2) - (bot.width / 2);
        bot.y = 15; 
        player.x = (gameCanvas.width / 2) - (player.width / 2);
        player.y = gameCanvas.height - 35; // Ekdum neeche
        
        baseSpeed = 7;
        maxSpeed = 12.5; // Mobile par touch ke liye perfect start speed
    } else {
        // DESKTOP (Horizontal Layout) - Fix ratio
        let maxCanvasWidth = Math.min(800, window.innerWidth * 0.9);
        gameCanvas.width = maxCanvasWidth;
        gameCanvas.height = maxCanvasWidth * 0.625;
        
        player.width = 12; player.height = 100;
        bot.width = 12; bot.height = 100;
        
        // Initial Positions
        bot.x = 30;
        bot.y = (gameCanvas.height / 2) - (bot.height / 2);
        player.x = gameCanvas.width - 40; // Ekdum right me
        player.y = (gameCanvas.height / 2) - (player.height / 2);
        
        baseSpeed = 5;
        maxSpeed = 10; // Desktop mouse par thodi zyada speed better lagti hai
    }
    
    // Ball ko center me rakho
    activeBall.x = gameCanvas.width / 2;
    activeBall.y = gameCanvas.height / 2;
}

// Window load ya resize hone par layout theek karega
window.addEventListener('resize', adjustGameLayout);
adjustGameLayout(); // First time chalao


function movePlayer(clientX, clientY) {
    if(isGameOver || !gameCanvas) return;
    
    let rect = gameCanvas.getBoundingClientRect();
    let scaleX = gameCanvas.width / rect.width;
    let scaleY = gameCanvas.height / rect.height;

    let newX = (clientX - rect.left) * scaleX;
    let newY = (clientY - rect.top) * scaleY;

    if (isMobile) {
        // MOBILE: Bottom-half me free ghoomo
        let paddleX = newX - (player.width / 2);
        
        // Racket screen ke bahar na jaye
        if (paddleX < 0) paddleX = 0;
        if (paddleX > gameCanvas.width - player.width) paddleX = gameCanvas.width - player.width;
        player.x = paddleX;
        
        // Bottom area me up-down movement
        let paddleY = newY - (player.height / 2);
        if (paddleY < gameCanvas.height / 2 + 10) paddleY = gameCanvas.height / 2 + 10; 
        if (paddleY > gameCanvas.height - player.height) paddleY = gameCanvas.height - player.height;
        player.y = paddleY;
    } else {
        // DESKTOP: Right-half me free ghoomo
        let paddleY = newY - (player.height / 2);
        
        // Racket screen ke bahar na jaye
        if (paddleY < 0) paddleY = 0;
        if (paddleY > gameCanvas.height - player.height) paddleY = gameCanvas.height - player.height;
        player.y = paddleY;

        // Right area me left-right movement
        let paddleX = newX - (player.width / 2);
        if (paddleX < gameCanvas.width / 2 + 10) paddleX = gameCanvas.width / 2 + 10; 
        if (paddleX > gameCanvas.width - player.width) paddleX = gameCanvas.width - player.width;
        player.x = paddleX;
    }
}

if (gameCanvas) {
    gameCanvas.addEventListener('mousemove', (e) => { movePlayer(e.clientX, e.clientY); });
    gameCanvas.addEventListener('touchmove', (e) => { 
        e.preventDefault(); 
        movePlayer(e.touches[0].clientX, e.touches[0].clientY); 
    }, {passive: false});
    gameCanvas.addEventListener('click', () => { if(isGameOver && typeof startGame === 'function') startGame(); });
}

// Ball Speed Increase & Limit function (Ekdum smooth progression ke liye)
function applyBallAcceleration() {
    activeBall.dx *= 1.03; // Pehle 1.05 tha, ab thoda smooth badhegi
    activeBall.dy *= 1.03;

    // Max limit lagana taaki ball bullet na ban jaye
    if (activeBall.dx > maxSpeed) activeBall.dx = maxSpeed;
    if (activeBall.dx < -maxSpeed) activeBall.dx = -maxSpeed;
    if (activeBall.dy > maxSpeed) activeBall.dy = maxSpeed;
    if (activeBall.dy < -maxSpeed) activeBall.dy = -maxSpeed;
}

function drawFullGame() {
    if(!isGameActive || isGameOver || !gCtx) return;
    // keyboard moment guys 
    applyKeyboardMovement();
    // Background
    gCtx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    gCtx.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
    
    // WATERMARK (YOU vs BOT)
    gCtx.font = "bold 60px monospace";
    gCtx.textAlign = "center";
    gCtx.textBaseline = "middle";
    gCtx.fillStyle = "rgba(255, 255, 255, 0.06)";
    
    if (isMobile) {
        gCtx.fillText("BOT", gameCanvas.width/2, gameCanvas.height/4);
        gCtx.fillText("YOU", gameCanvas.width/2, (gameCanvas.height/4) * 3);
    } else {
        gCtx.fillText("BOT", gameCanvas.width/4, gameCanvas.height/2);
        gCtx.fillText("YOU", (gameCanvas.width/4) * 3, gameCanvas.height/2);
    }

    // Net Line
    gCtx.strokeStyle = 'rgba(57, 255, 20, 0.3)';
    gCtx.setLineDash([10, 15]);
    gCtx.beginPath();
    if (isMobile) {
        gCtx.moveTo(0, gameCanvas.height/2); 
        gCtx.lineTo(gameCanvas.width, gameCanvas.height/2);
    } else {
        gCtx.moveTo(gameCanvas.width/2, 0); 
        gCtx.lineTo(gameCanvas.width/2, gameCanvas.height);
    }
    gCtx.stroke();
    gCtx.setLineDash([]);

    // Draw Ball
    gCtx.shadowBlur = 15;
    gCtx.shadowColor = '#39ff14';
    gCtx.beginPath();
    gCtx.arc(activeBall.x, activeBall.y, activeBall.radius, 0, Math.PI * 2);
    gCtx.fillStyle = '#39ff14';
    gCtx.fill();
    gCtx.closePath();

    // Rackets
    gCtx.fillStyle = '#fff';
    gCtx.shadowBlur = 10;
    gCtx.shadowColor = '#fff';
    gCtx.fillRect(player.x, player.y, player.width, player.height);

    gCtx.fillStyle = '#ff3333'; 
    gCtx.shadowColor = '#ff3333';
    gCtx.fillRect(bot.x, bot.y, bot.width, bot.height);

    // Ball & Bot Movements
    if (!isBallPaused) {
        activeBall.x += activeBall.dx;
        activeBall.y += activeBall.dy;
        
        if (isMobile) {
            let botCenter = bot.x + bot.width/2;
            bot.x += (activeBall.x - botCenter) * 0.06; 

            let targetY = activeBall.y < gameCanvas.height/2 ? activeBall.y - 40 : 20;
            bot.y += (targetY - bot.y) * 0.015;
            if(bot.x < 0) bot.x = 0;
            if(bot.x + bot.width > gameCanvas.width) bot.x = gameCanvas.width - bot.width;
            bot.y = 20; 
        } else {
            let botCenter = bot.y + bot.height/2;
            bot.y += (activeBall.y - botCenter) * 0.06; 

            let targetX = activeBall.x < gameCanvas.width/2 ? activeBall.x - 40 : 30;
            bot.x += (targetX - bot.x) * 0.015;
            if(bot.y < 0) bot.y = 0;
            if(bot.y + bot.height > gameCanvas.height) bot.y = gameCanvas.height - bot.height;
            bot.x = 30; 
        }
    }

    // Walls & Goals Collision
    if (isMobile) {
        if (activeBall.x - activeBall.radius < 0 || activeBall.x + activeBall.radius > gameCanvas.width) {
            activeBall.dx = -activeBall.dx;
        }
        if (activeBall.y < 0) { player.score++; checkWin(); } 
        else if (activeBall.y > gameCanvas.height) { bot.score++; checkWin(); }
    } else {
        if (activeBall.y - activeBall.radius < 0 || activeBall.y + activeBall.radius > gameCanvas.height) {
            activeBall.dy = -activeBall.dy;
        }
        if (activeBall.x < 0) { player.score++; checkWin(); } 
        else if (activeBall.x > gameCanvas.width) { bot.score++; checkWin(); }
    }

    // Universal Racket Hit Collision
    if (activeBall.x + activeBall.radius >= player.x && 
        activeBall.x - activeBall.radius <= player.x + player.width &&
        activeBall.y + activeBall.radius >= player.y &&
        activeBall.y - activeBall.radius <= player.y + player.height) {
        
        if (isMobile) activeBall.dy = -Math.abs(activeBall.dy); 
        else activeBall.dx = -Math.abs(activeBall.dx); 
        
        applyBallAcceleration(); // 🔴 Smooth Speed up with Limiter
    }

    if (activeBall.x + activeBall.radius >= bot.x && 
        activeBall.x - activeBall.radius <= bot.x + bot.width &&
        activeBall.y + activeBall.radius >= bot.y &&
        activeBall.y - activeBall.radius <= bot.y + bot.height) {
        
        if (isMobile) activeBall.dy = Math.abs(activeBall.dy); 
        else activeBall.dx = Math.abs(activeBall.dx); 
        
        applyBallAcceleration(); // 🔴 Smooth Speed up with Limiter
    }

    // Score Update
    let pScore = document.getElementById('playerScore');
    let bScore = document.getElementById('botScore');
    if(pScore) pScore.innerText = player.score;
    if(bScore) bScore.innerText = bot.score;

    gameLoop = requestAnimationFrame(drawFullGame);
}

function resetBallWithDelay() {
    isBallPaused = true;
    activeBall.x = gameCanvas.width / 2;
    activeBall.y = gameCanvas.height / 2;
    
    setTimeout(() => {
        if(isGameOver) return;
        isBallPaused = false;
        
        let dirX = Math.random() > 0.5 ? 1 : -1;
        let dirY = Math.random() > 0.5 ? 1 : -1;
        
        // Mobile me straight up/down jaisi dead ball na aaye uske liye thoda X angle denge
        if(isMobile) {
            activeBall.dx = (Math.random() * 2 + 1.5) * dirX; 
            activeBall.dy = baseSpeed * dirY;
        } else {
            activeBall.dx = baseSpeed * dirX;
            activeBall.dy = (Math.random() * 2 + 1.5) * dirY;
        }
        
    }, 800);
}

function checkWin() {
    if(player.score >= WINNING_SCORE || bot.score >= WINNING_SCORE) {
        isGameOver = true;
        let winnerText = player.score >= WINNING_SCORE ? "YOU WIN! " : "BOT WINS! ";
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
        
        let modal = document.getElementById('gameOverModal') || document.getElementById('gameOver');
        if (modal) modal.style.display = 'block';
    } else {
        resetBallWithDelay();
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
    window.scrollTo(0, 0);

    isGameActive = true;
    isGameOver = false;
    player.score = 0;
    bot.score = 0;
    
    // 1. Intro card ko hide karo taaki side-by-side clash na ho
    let gameIntro = document.getElementById('gameIntro');
    if(gameIntro) gameIntro.style.display = 'none';
    
    // 2. Full game container ko show karo
    let fullContainer = document.getElementById('fullGameContainer');
    if(fullContainer) fullContainer.style.display = 'flex';
    
    // 3. Game ko exactly screen ke hisaab se wapas se resize karo
    let modal = document.getElementById('gameOverModal') || document.getElementById('gameOver');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'hidden';
    adjustGameLayout();
    
    // Ball ko reset karke game loop start karo
    resetBallWithDelay();
    if(typeof gameLoop !== 'undefined' && gameLoop) {
        cancelAnimationFrame(gameLoop);
    }
    drawFullGame();
};
window.exitGame = function() {
    isGameActive = false;
    
    let fullContainer = document.getElementById('fullGameContainer');
    if(fullContainer) fullContainer.style.display = 'none';
    
    // Intro wapas dikhao
    let gameIntro = document.getElementById('gameIntro');
    if(gameIntro) gameIntro.style.display = 'block'; 
    
    let modal = document.getElementById('gameOverModal') || document.getElementById('gameOver');
    if (modal) modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    //navbaar fixing guys 
    let navbar = document.querySelector('.navbar');
    if(navbar) {
        navbar.style.display = 'flex';
        navbar.style.zIndex = '9999';
    }
}
// swiper slider jo bhi h ushka logic idhr h 
document.addEventListener('DOMContentLoaded', function() {
    const swiper = new Swiper('.mySwiper', {
        // CSS width ke hisaab se automatically cards fit karega
        loop: true,
        speed: 5000, // Smooth drag speed
        spaceBetween: 30,
        grabcursor: true,
        autoplay: {
            delay: 0,
            disableOnInteraction: false,
        },
        breakpoints: {
            0 : {
                slidesPerView: 1,
            }, 768: {
                slidesPerView: 2,                
            }, 1024: {
                slidesPerView: 4,
            }
        }
    });
});
/* =========================================
   QUIZ SECTION LOGIC
========================================= */
const quizData = [
    {
        question: "Q1. What is the actual meaning of 'Love' in tennis?",
        options: ["Finding your soulmate on the court", "Absolute Zero (0) score", "Hugging the umpire", "Giving up mid-match"],
        correct: 1, // Option B is correct
        trollMsgs: [
            "Soulmate on the court? Bro, we are playing tennis, not a dating simulator! ",
            "", // Sahi jawab ke liye koi troll nahi
            "Hugging the umpire? Bro is trying to get disqualified real quick. ",
            "Giving up? That's negative aura right there. Try again! "
        ]
    },
    {
        question: "Q2. If you finish a match with a 'Love' score, what actually happened to you?",
        options: ["+1000 Aura unlocked", "You got absolutely cooked", "You unlocked a secret racket skin", "You won the match flawlessly"],
        correct: 1, 
        trollMsgs: [
            "+1000 Aura for losing without scoring a single point? Nah bro, your aura is in the minus. ",
            "", 
            "This isn't Fortnite. You just got bageled and sent home. ",
            "Winning with zero points? Delulu is truly your solulu. "
        ]
    },
    {
        question: "Q3. When a player completely loses their chill and destroys their racket on the court, what's the vibe?",
        options: ["Tactical genius", "Serving looks", "Max crash-out energy", "W Rizz"],
        correct: 2, 
        trollMsgs: [
            "Destroying a $300 racket is a tactic? Bro's financial literacy is cooked. ",
            "Serving looks while screaming like a toddler? Big yikes. ",
            "", 
            "W Rizz? Bruh, nobody is getting rizzed by an angry tantrum. "
        ]
    },
    {
        question: "Q4. Why do some players grunt at 100 decibels when hitting the ball?",
        options: ["To intimidate the opps", "It actually adds power, fr", "Just for the TikTok aesthetics", "They forgot how to breathe"],
        correct: 1, 
        trollMsgs: [
            "Opps aren't scared of a grunt, they are scared of a 130mph serve. Try again! ",
            "", 
            "Aesthetics? Bro, they are fighting for their lives out there, not making a reel! ",
            "Forgot how to breathe? Bruh, they are pro athletes, not me climbing stairs. "
        ]
    },
    {
        question: "Q5. What does it mean when a player hits a 'Tweener'?",
        options: ["Posting a tweet mid-match", "A basic boring forehand", "Hitting the ball between the legs", "Crying to the referee"],
        correct: 2, 
        trollMsgs: [
            "Tweeting mid-match? Bro thinks this is a podcast. Focus on the game! ",
            "Basic forehand? That's literally the most boring answer you could pick. ",
            "", 
            "Crying to the ref is called a 'Karen move', not a tweener. "
        ]
    }
];

let currentQuestion = 0;

// Elements select karna
const questionEl = document.querySelector('.question-box h3');
const optionsGrid = document.querySelector('.options-grid');
const trollBox = document.querySelector('.troll-box');

function loadQuestion() {
    // Purana data saaf karna
    trollBox.classList.remove('show');
    trollBox.innerText = "";
    optionsGrid.innerHTML = '';

    const currentData = quizData[currentQuestion];
    questionEl.innerText = currentData.question;

    // Naye buttons generate karna
    currentData.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.innerText = option;
        
        btn.onclick = () => checkAnswer(index, btn);
        optionsGrid.appendChild(btn);
    });
}

function checkAnswer(selectedIndex, btnElement) {
    const currentData = quizData[currentQuestion];
    const correctIndex = currentData.correct;
    
    // Agar Sahi Jawab Hai
    if (selectedIndex === correctIndex) {
        btnElement.classList.add('right-choice');
        trollBox.classList.remove('show'); 
        
        // Buttons disable kar do
        const allButtons = optionsGrid.querySelectorAll('button');
        allButtons.forEach(b => b.disabled = true);
        
        // 1.2 second delay ke baad next question
        setTimeout(() => {
            currentQuestion++;
            if (currentQuestion < quizData.length) {
                loadQuestion(); 
            } else {
                questionEl.innerText = "🎾 Absolute Cinema! You survived the Quiz! W Aura ";
                optionsGrid.innerHTML = '';
                trollBox.classList.remove('show');
            }
        }, 1200);
        
    } 
    // Agar Galat Jawab Hai (Har galat par alag troll)
    else {
        btnElement.classList.add('wrong-choice'); 
        
        // Uss specific galat option ka troll message dikhao
        trollBox.innerText = currentData.trollMsgs[selectedIndex];
        trollBox.classList.add('show'); 
        
        // Shake effect hatao taaki wapas click ho sake
        setTimeout(() => {
            btnElement.classList.remove('wrong-choice');
        }, 400);
    }
}

// First time load
if (questionEl && optionsGrid) {
    loadQuestion();
}
// light theme logic starts from here 

document.addEventListener('DOMContentLoaded', function() {
    const themeCheckboxes = document.querySelectorAll('.theme-checkbox');

    function applyTheme(themeName) {
        if (themeName === 'light') {
            document.body.setAttribute('data-theme', 'light');
            themeCheckboxes.forEach(cb => cb.checked = true);
        } else {
            document.body.removeAttribute('data-theme');
            themeCheckboxes.forEach(cb => cb.checked = false);
        }
    }

    let currentTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(currentTheme);

    themeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function(e) {
            let newTheme = e.target.checked ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });
    });
});
// adding extra keyboard moment for desktop 

let keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        e.preventDefault();  
        keys[e.key] = true;
    }
});
window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

function applyKeyboardMovement() {
    let speed = 8;
    if (isMobile) {
        if (keys.ArrowLeft) player.x = Math.max(0, player.x - speed);
        if (keys.ArrowRight) player.x = Math.min(gameCanvas.width - player.width, player.x + speed);
        if (keys.ArrowUp) player.y = Math.max(gameCanvas.height / 2 + 10, player.y - speed);
        if (keys.ArrowDown) player.y = Math.min(gameCanvas.height - player.height, player.y + speed);
    } else {
        if (keys.ArrowUp) player.y = Math.max(0, player.y - speed);
        if (keys.ArrowDown) player.y = Math.min(gameCanvas.height - player.height, player.y + speed);
        if (keys.ArrowLeft) player.x = Math.max(gameCanvas.width / 2 + 10, player.x - speed);
        if (keys.ArrowRight) player.x = Math.min(gameCanvas.width - player.width, player.x + speed);
    }
};