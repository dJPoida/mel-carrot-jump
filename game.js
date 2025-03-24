// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const GROUND_HEIGHT = 50;
const BUNNY_WIDTH = 32;
const BUNNY_HEIGHT = 32;
const JUMP_FORCE = -15;
const GRAVITY = 0.8;
const INITIAL_SCROLL_SPEED = 3;
const MAX_SCROLL_SPEED = 8;
const SPEED_INCREASE_INTERVAL = 5000; // 5 seconds
const INITIAL_LIVES = 3;
const DEFAULT_BUNNY_X = 100;
const RETURN_TO_CENTER_SPEED = 0.5;
const PARTICLE_COUNT = 10;
const SHAKE_DURATION = 500; // milliseconds
const SHAKE_INTENSITY = 5;
const INITIAL_OBSTACLE_SPAWN_RATE = 0.02;
const INITIAL_CARROT_SPAWN_RATE = 0.01;
const SPEED_INCREASE_PER_CARROT = 0.5; // Speed increase per carrot collected

// Sound effects
let audioContext;
let jumpSound;
let hitSound;
let deathSound;
let carrotSound;
let currentSound = null; // Track current playing sound
let deathSoundPlayed = false; // Track if death sound has played

// Game state
let canvas, ctx;
let gameLoop;
let speedIncreaseInterval;
let score = 0;
let highScore = localStorage.getItem('bunnyGameHighScore') || 0;
let scrollSpeed = INITIAL_SCROLL_SPEED;
let gameStarted = false;
let gameOver = false;
let lives = INITIAL_LIVES;
let isNewHighScore = false;
let screenShake = 0;
let particles = [];
let obstacleSpawnRate = INITIAL_OBSTACLE_SPAWN_RATE;
let carrotSpawnRate = INITIAL_CARROT_SPAWN_RATE;
let isDeathAnimation = false;
let deathStartTime = 0;
let deathStartY = 0;
let deathStartRotation = 0;
let deathJumpVelocity = 0;
let deathRotationVelocity = 0;
let deathFallVelocity = 0;
let deathGravity = 0;
let deathFinalRotation = 0;
let deathFinalY = 0;
let isSplashScreen = true;
let splashStartTime = 0;
const SPLASH_DURATION = 2000; // 2 seconds

// Initialize sound effects
function initSounds() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Jump sound (8-bit style)
    function createJumpSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        return { oscillator, gainNode };
    }
    
    // Hit sound (8-bit style)
    function createHitSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        return { oscillator, gainNode };
    }
    
    // Death sound (8-bit fart style)
    function createDeathSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const noiseNode = audioContext.createBufferSource();
        
        // Create noise buffer for "fart" effect
        const bufferSize = audioContext.sampleRate * 0.3; // 0.3 seconds of noise
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1; // Random values between -1 and 1
        }
        
        // Configure noise
        noiseNode.buffer = buffer;
        noiseNode.loop = false;
        
        // Configure oscillator for frequency sweep
        oscillator.type = 'sawtooth'; // More "farty" sound
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
        
        // Configure gain envelope for longer duration
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        // Connect nodes
        noiseNode.connect(gainNode);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        return { oscillator, gainNode, noiseNode };
    }
    
    // Carrot sound (8-bit style)
    function createCarrotSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const noiseNode = audioContext.createBufferSource();
        
        // Create noise buffer
        const bufferSize = audioContext.sampleRate * 0.1; // 0.1 seconds of noise
        const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1; // Random values between -1 and 1
        }
        
        // Configure noise
        noiseNode.buffer = buffer;
        noiseNode.loop = false;
        
        // Configure oscillator for frequency modulation
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.05);
        
        // Configure gain envelope
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        
        // Connect nodes
        noiseNode.connect(gainNode);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        return { oscillator, gainNode, noiseNode };
    }
    
    jumpSound = createJumpSound;
    hitSound = createHitSound;
    deathSound = createDeathSound;
    carrotSound = createCarrotSound;
}

// Play sound effect
function playSound(soundFunction) {
    // Don't play death sound if it's already played
    if (soundFunction === deathSound && deathSoundPlayed) {
        return;
    }
    
    // Stop any currently playing sound
    if (currentSound) {
        currentSound.oscillator.stop();
        if (currentSound.noiseNode) {
            currentSound.noiseNode.stop();
        }
    }
    
    // Create and play new sound
    currentSound = soundFunction();
    currentSound.oscillator.start();
    if (currentSound.noiseNode) {
        currentSound.noiseNode.start();
    }
    
    // Mark death sound as played
    if (soundFunction === deathSound) {
        deathSoundPlayed = true;
    }
    
    // Stop the sound after its duration
    const duration = 0.3; // Duration in seconds
    currentSound.oscillator.stop(audioContext.currentTime + duration);
    if (currentSound.noiseNode) {
        currentSound.noiseNode.stop(audioContext.currentTime + duration);
    }
}

// Particle class
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.speedX = (Math.random() - 0.5) * 8;
        this.speedY = (Math.random() - 0.5) * 8;
        this.life = 1.0; // Life in seconds
        this.color = '#FF0000';
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.02; // Fade out
        this.speedY += 0.2; // Gravity effect
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Bunny state
const bunny = {
    x: 100,
    y: CANVAS_HEIGHT - GROUND_HEIGHT - BUNNY_HEIGHT,
    width: BUNNY_WIDTH,
    height: BUNNY_HEIGHT,
    velocityY: 0,
    isJumping: false,
    canDoubleJump: true,
    invulnerable: false,
    rotation: 0
};

// Game objects
let obstacles = [];
let carrots = [];
let platforms = [];

// Show splash screen
function showSplashScreen() {
    isSplashScreen = true;
    splashStartTime = Date.now();
    
    // Create and show splash screen
    const splashScreen = document.createElement('div');
    splashScreen.id = 'splashScreen';
    splashScreen.innerHTML = `
        <h1>Carrot Jump</h1>
        <div class="rules">
            <p>🎯 Collect the carrots to win</p>
            <p>⚠️ Avoid the spikes</p>
            <p>❤️ You get three lives</p>
            <p>⚡ The game gets faster!</p>
        </div>
        <p class="start-text">Press SPACE to Start</p>
    `;
    document.body.appendChild(splashScreen);
    
    // Add styles for splash screen
    const style = document.createElement('style');
    style.textContent = `
        #splashScreen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: white;
            z-index: 1000;
            font-family: 'Press Start 2P', cursive;
        }
        
        #splashScreen h1 {
            font-size: 3em;
            margin-bottom: 40px;
            color: #FFA500;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        
        .rules {
            background-color: rgba(0, 0, 0, 0.5);
            padding: 20px 40px;
            border-radius: 10px;
            margin-bottom: 40px;
            border: 2px solid #FFA500;
        }
        
        .rules p {
            font-size: 1em;
            margin: 15px 0;
            color: #FFFFFF;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
        }
        
        .start-text {
            font-size: 1.2em;
            color: #FFA500;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    // Initialize sound effects
    initSounds();
    
    // Event listeners
    document.addEventListener('keydown', handleKeyPress);
    document.getElementById('restartButton').addEventListener('click', restartGame);
    
    // Add double-click listener for high score reset
    document.getElementById('highScore').addEventListener('dblclick', () => {
        highScore = 0;
        localStorage.setItem('bunnyGameHighScore', 0);
        document.getElementById('highScore').textContent = 'High Score: 0';
    });
    
    // Show splash screen
    showSplashScreen();
}

// Start game
function startGame() {
    gameStarted = true;
    gameOver = false;
    score = 0;
    lives = INITIAL_LIVES;
    scrollSpeed = INITIAL_SCROLL_SPEED;
    obstacleSpawnRate = INITIAL_OBSTACLE_SPAWN_RATE;
    carrotSpawnRate = INITIAL_CARROT_SPAWN_RATE;
    obstacles = [];
    carrots = [];
    platforms = [];
    bunny.y = CANVAS_HEIGHT - GROUND_HEIGHT - BUNNY_HEIGHT;
    bunny.velocityY = 0;
    bunny.isJumping = false;
    bunny.canDoubleJump = true;
    bunny.rotation = 0;
    isNewHighScore = false;
    screenShake = 0;
    particles = [];
    isDeathAnimation = false;
    deathSoundPlayed = false; // Reset death sound flag
    
    // Reset game over title style
    const gameOverTitle = document.getElementById('gameOverTitle');
    gameOverTitle.textContent = 'Game Over!';
    gameOverTitle.style.color = 'white';
    gameOverTitle.style.fontSize = '1em';
    gameOverTitle.style.textShadow = 'none';
    
    // Hide game over screen and reset button state
    const gameOverScreen = document.getElementById('gameOver');
    const restartButton = document.getElementById('restartButton');
    gameOverScreen.classList.add('hidden');
    restartButton.disabled = false;
    restartButton.textContent = 'Play Again';
    
    document.getElementById('score').textContent = 'Score: 0';
    document.getElementById('highScore').textContent = `High Score: ${highScore}`;
    updateLivesDisplay();
    
    // Start game loop
    gameLoop = setInterval(update, 1000 / 60);
}

// Restart game
function restartGame() {
    clearInterval(gameLoop);
    clearInterval(speedIncreaseInterval);
    startGame();
}

// Handle keyboard input
function handleKeyPress(event) {
    if (isSplashScreen) {
        if (event.code === 'Space') {
            // Remove splash screen
            const splashScreen = document.getElementById('splashScreen');
            if (splashScreen) {
                splashScreen.remove();
            }
            isSplashScreen = false;
            startGame();
        }
        return;
    }
    
    if (event.code === 'Space' && !gameOver) {
        if (!bunny.isJumping) {
            // First jump
            bunny.velocityY = JUMP_FORCE;
            bunny.isJumping = true;
            playSound(jumpSound);
        } else if (bunny.canDoubleJump) {
            // Double jump
            bunny.velocityY = JUMP_FORCE;
            bunny.canDoubleJump = false;
            playSound(jumpSound);
        }
    }
    // Add Enter key support for restarting
    if (event.code === 'Enter' && gameOver) {
        const restartButton = document.getElementById('restartButton');
        if (!restartButton.disabled) {
            restartGame();
        }
    }
}

// Update game state
function update() {
    if (gameOver || isSplashScreen) return;
    
    // Update screen shake
    if (screenShake > 0) {
        screenShake -= 16.67; // Approximately 60fps
    }
    
    // Update particles
    particles = particles.filter(particle => {
        particle.update();
        return particle.life > 0;
    });
    
    // Handle death animation
    if (isDeathAnimation) {
        updateDeathAnimation();
    } else {
        // Update bunny position
        bunny.velocityY += GRAVITY;
        bunny.y += bunny.velocityY;
        
        // Return bunny to default x position if it's not there
        if (bunny.x !== DEFAULT_BUNNY_X) {
            if (bunny.x < DEFAULT_BUNNY_X) {
                bunny.x += RETURN_TO_CENTER_SPEED;
            } else {
                bunny.x -= RETURN_TO_CENTER_SPEED;
            }
        }
        
        // Ground collision
        if (bunny.y > CANVAS_HEIGHT - GROUND_HEIGHT - BUNNY_HEIGHT) {
            bunny.y = CANVAS_HEIGHT - GROUND_HEIGHT - BUNNY_HEIGHT;
            bunny.velocityY = 0;
            bunny.isJumping = false;
            bunny.canDoubleJump = true;
        }
    }
    
    // Generate obstacles and carrots
    if (Math.random() < obstacleSpawnRate) {
        obstacles.push({
            x: CANVAS_WIDTH,
            y: CANVAS_HEIGHT - GROUND_HEIGHT - 32,
            width: 32,
            height: 32
        });
    }
    
    if (Math.random() < carrotSpawnRate) {
        // Vary carrot height between 64 and 160 pixels from ground
        const minHeight = 64;
        const maxHeight = 160;
        const randomHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        carrots.push({
            x: CANVAS_WIDTH,
            y: CANVAS_HEIGHT - GROUND_HEIGHT - randomHeight,
            width: 24,
            height: 24
        });
    }
    
    // Generate platforms
    if (Math.random() < 0.01) {
        // Vary platform height between 96 and 200 pixels from ground
        const minHeight = 96;
        const maxHeight = 200;
        const randomHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        platforms.push({
            x: CANVAS_WIDTH,
            y: CANVAS_HEIGHT - GROUND_HEIGHT - randomHeight,
            width: 64,
            height: 16
        });
    }
    
    // Update obstacles
    obstacles = obstacles.filter(obstacle => {
        obstacle.x -= scrollSpeed;
        return obstacle.x > -obstacle.width;
    });
    
    // Update carrots
    carrots = carrots.filter(carrot => {
        carrot.x -= scrollSpeed;
        return carrot.x > -carrot.width;
    });
    
    // Update platforms
    platforms = platforms.filter(platform => {
        platform.x -= scrollSpeed;
        return platform.x > -platform.width;
    });
    
    // Check collisions
    if (!isDeathAnimation) {
        checkCollisions();
    }
    
    // Draw everything
    draw();
}

// Show game over screen
function showGameOver() {
    gameOver = true;
    document.getElementById('gameOver').classList.remove('hidden');
    document.getElementById('finalScore').textContent = Math.floor(score / 100); // Updated to match new scoring system
    document.getElementById('finalHighScore').textContent = highScore;
    
    // Save high score
    localStorage.setItem('bunnyGameHighScore', highScore);
    
    // Show high score celebration if applicable
    if (isNewHighScore) {
        const gameOverTitle = document.getElementById('gameOverTitle');
        gameOverTitle.textContent = 'New High Score! 🎉';
        gameOverTitle.style.color = '#FFD700';
        gameOverTitle.style.fontSize = '2em';
        gameOverTitle.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
    } else {
        // Show bunny kebab message for normal game over
        const gameOverTitle = document.getElementById('gameOverTitle');
        gameOverTitle.textContent = 'You are a bunny kebab! 🍖';
        gameOverTitle.style.color = '#FF6B6B';
        gameOverTitle.style.fontSize = '1.5em';
        gameOverTitle.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
    }
    
    // Disable the restart button
    const restartButton = document.getElementById('restartButton');
    restartButton.disabled = true;
    
    // Enable the button after 2 seconds
    setTimeout(() => {
        restartButton.disabled = false;
        restartButton.focus();
    }, 2000);
}

// Update lives display
function updateLivesDisplay() {
    const livesContainer = document.getElementById('lives');
    livesContainer.innerHTML = ''; // Clear existing hearts
    
    // Create hearts based on remaining lives
    for (let i = 0; i < INITIAL_LIVES; i++) {
        const heart = document.createElement('div');
        heart.className = `heart${i >= lives ? ' empty' : ''}`;
        // Add the middle triangle element
        const middle = document.createElement('div');
        middle.className = 'middle';
        heart.appendChild(middle);
        livesContainer.appendChild(heart);
    }
}

// Handle player death
function handlePlayerDeath() {
    if (isDeathAnimation) return;
    
    // Create hit particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle(
            bunny.x + bunny.width/2,
            bunny.y + bunny.height/2
        ));
    }
    
    // Start screen shake
    screenShake = SHAKE_DURATION;
    
    // Decrement lives
    lives--;
    updateLivesDisplay();
    
    // If no lives left, start death animation with fart sound
    if (lives <= 0) {
        isDeathAnimation = true;
        deathStartTime = Date.now();
        deathStartY = bunny.y;
        deathStartRotation = 0;
        deathJumpVelocity = -20; // Initial jump velocity
        deathGravity = 0.8; // Normal gravity
        deathFinalRotation = -90; // Land on side
        deathFinalY = CANVAS_HEIGHT - GROUND_HEIGHT - BUNNY_HEIGHT;
        playSound(deathSound); // Play fart sound for final death
    } else {
        // Reset bunny position and give brief invulnerability
        bunny.x = DEFAULT_BUNNY_X;
        bunny.y = CANVAS_HEIGHT - GROUND_HEIGHT - BUNNY_HEIGHT;
        bunny.velocityY = 0;
        bunny.isJumping = false;
        bunny.canDoubleJump = true;
        bunny.invulnerable = true;
        playSound(hitSound); // Play regular hit sound for non-fatal hits
        setTimeout(() => {
            bunny.invulnerable = false;
        }, 2000);
    }
}

// Update death animation
function updateDeathAnimation() {
    if (!isDeathAnimation) return;
    
    const elapsed = (Date.now() - deathStartTime) / 1000;
    
    if (elapsed < 1.0) { // Complete animation in 1 second
        // Calculate vertical position (parabolic motion)
        const jumpHeight = deathJumpVelocity * elapsed;
        const fallDistance = 0.5 * deathGravity * elapsed * elapsed;
        bunny.y = deathStartY + jumpHeight + fallDistance;
        
        // Calculate rotation (linear rotation to -90 degrees)
        bunny.rotation = deathStartRotation + (deathFinalRotation * elapsed);
        
        // Ensure we don't go below ground
        if (bunny.y > deathFinalY) {
            bunny.y = deathFinalY;
        }
        
        // Ensure we don't rotate past final rotation
        if (bunny.rotation < deathFinalRotation) {
            bunny.rotation = deathFinalRotation;
        }
    } else {
        // Final position
        bunny.y = deathFinalY;
        bunny.rotation = deathFinalRotation;
        
        // End death animation and show game over without playing sound
        isDeathAnimation = false;
        gameOver = true;
        showGameOver();
    }
}

// Check collisions
function checkCollisions() {
    // Check obstacle collisions
    for (let obstacle of obstacles) {
        if (isColliding(bunny, obstacle)) {
            // Only take damage if not invulnerable
            if (!bunny.invulnerable) {
                handlePlayerDeath();
                return;
            }
        }
    }
    
    // Check carrot collisions
    carrots = carrots.filter(carrot => {
        if (isColliding(bunny, carrot)) {
            // Play carrot sound
            playSound(carrotSound);
            
            score += 100;
            const currentScore = Math.floor(score / 100); // Convert to actual score
            document.getElementById('score').textContent = `Score: ${currentScore}`;
            
            // Increase speed based on carrots collected
            if (scrollSpeed < MAX_SCROLL_SPEED) {
                scrollSpeed += SPEED_INCREASE_PER_CARROT;
                
                // Increase obstacle and carrot spawn rates with speed
                if (scrollSpeed > 5) {
                    obstacleSpawnRate = 0.03;
                }
                if (scrollSpeed > 6) {
                    carrotSpawnRate = 0.015;
                }
            }
            
            // Check for new high score
            if (currentScore > highScore) {
                highScore = currentScore;
                document.getElementById('highScore').textContent = `High Score: ${highScore}`;
                isNewHighScore = true;
            }
            return false;
        }
        return true;
    });
    
    // Check platform collisions
    for (let platform of platforms) {
        if (isColliding(bunny, platform)) {
            // Calculate collision direction
            const bunnyBottom = bunny.y + bunny.height;
            const bunnyTop = bunny.y;
            const platformTop = platform.y;
            const platformBottom = platform.y + platform.height;
            
            // Check if collision is from above (bunny is falling)
            if (bunny.velocityY > 0 && 
                bunnyBottom - bunny.velocityY <= platformTop) {
                bunny.y = platformTop - bunny.height;
                bunny.velocityY = 0;
                bunny.isJumping = false;
                bunny.canDoubleJump = true;
            }
            // Check if collision is from below (bunny is jumping)
            else if (bunny.velocityY < 0 && 
                     bunnyTop - bunny.velocityY >= platformBottom) {
                bunny.y = platformBottom;
                bunny.velocityY = 0;
            }
            // Check if collision is from the side
            else if (bunnyBottom > platformTop && bunnyTop < platformBottom) {
                const bunnyRight = bunny.x + bunny.width;
                const bunnyLeft = bunny.x;
                const platformRight = platform.x + platform.width;
                const platformLeft = platform.x;
                
                // Determine which side the collision is from
                const rightOverlap = bunnyRight - platformLeft;
                const leftOverlap = platformRight - bunnyLeft;
                
                if (rightOverlap < leftOverlap) {
                    // Collision from right
                    bunny.x = platformLeft - bunny.width;
                } else {
                    // Collision from left
                    bunny.x = platformRight;
                }
            }
        }
    }
    
    // Check if bunny fell into a hole
    if (bunny.y > CANVAS_HEIGHT) {
        handlePlayerDeath();
    }
}

// Collision detection
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Draw game objects
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Apply screen shake
    if (screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * SHAKE_INTENSITY;
        const shakeY = (Math.random() - 0.5) * SHAKE_INTENSITY;
        ctx.save();
        ctx.translate(shakeX, shakeY);
    }
    
    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, CANVAS_HEIGHT - GROUND_HEIGHT, CANVAS_WIDTH, GROUND_HEIGHT);
    
    // Draw particles
    particles.forEach(particle => particle.draw(ctx));
    
    // Draw obstacles (spikes)
    obstacles.forEach(spike => {
        // Create metallic gradient
        const gradient = ctx.createLinearGradient(
            spike.x, 
            spike.y, 
            spike.x + spike.width, 
            spike.y + spike.height
        );
        gradient.addColorStop(0, '#C0C0C0');   // Silver base
        gradient.addColorStop(0.3, '#FFFFFF'); // Highlight
        gradient.addColorStop(0.7, '#A0A0A0'); // Shadow
        gradient.addColorStop(1, '#808080');   // Dark edge
        
        // Draw spike body with gradient
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(spike.x, spike.y + spike.height);
        ctx.lineTo(spike.x + spike.width/2, spike.y);
        ctx.lineTo(spike.x + spike.width, spike.y + spike.height);
        ctx.closePath();
        ctx.fill();
        
        // Add metallic shine effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.moveTo(spike.x, spike.y + spike.height);
        ctx.lineTo(spike.x + spike.width/4, spike.y + spike.height/2);
        ctx.lineTo(spike.x + spike.width/2, spike.y);
        ctx.closePath();
        ctx.fill();
    });
    
    // Draw carrots
    carrots.forEach(carrot => {
        // Draw carrot body (triangle shape)
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.moveTo(carrot.x, carrot.y);
        ctx.lineTo(carrot.x + carrot.width/2, carrot.y + carrot.height);
        ctx.lineTo(carrot.x + carrot.width, carrot.y);
        ctx.closePath();
        ctx.fill();
        
        // Draw carrot leaves (green) at the top
        ctx.fillStyle = '#4CAF50';
        // Left leaf
        ctx.beginPath();
        ctx.moveTo(carrot.x + carrot.width/4, carrot.y);
        ctx.lineTo(carrot.x + carrot.width/2, carrot.y - carrot.height/2);
        ctx.lineTo(carrot.x + carrot.width/3, carrot.y);
        ctx.closePath();
        ctx.fill();
        
        // Right leaf
        ctx.beginPath();
        ctx.moveTo(carrot.x + carrot.width*3/4, carrot.y);
        ctx.lineTo(carrot.x + carrot.width/2, carrot.y - carrot.height/2);
        ctx.lineTo(carrot.x + carrot.width*2/3, carrot.y);
        ctx.closePath();
        ctx.fill();
    });
    
    // Draw platforms
    ctx.fillStyle = '#4CAF50';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
    
    // Draw bunny with rotation if in death animation
    if (isDeathAnimation) {
        ctx.save();
        ctx.translate(bunny.x + bunny.width/2, bunny.y + bunny.height/2);
        ctx.rotate(bunny.rotation * Math.PI / 180); // Convert degrees to radians
        ctx.translate(-(bunny.x + bunny.width/2), -(bunny.y + bunny.height/2));
    }
    
    // Draw bunny (simple pixel art)
    // Create flashing effect for invulnerability
    let flashIntensity = 1;
    if (bunny.invulnerable) {
        // Create a square wave pattern (alternating between 1 and 0.3)
        flashIntensity = Math.floor(Date.now() / 100) % 2 === 0 ? 1 : 0.3;
    }
    
    // Draw bunny body with flashing effect
    ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity})`;
    ctx.fillRect(bunny.x, bunny.y, bunny.width, bunny.height);
    
    // Draw ears with flashing effect
    ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity})`;
    ctx.fillRect(bunny.x - 4, bunny.y - 8, 8, 16);
    ctx.fillRect(bunny.x + bunny.width - 4, bunny.y - 8, 8, 16);
    
    // Draw eyes with flashing effect
    ctx.fillStyle = `rgba(0, 0, 0, ${flashIntensity})`;
    ctx.fillRect(bunny.x + 8, bunny.y + 8, 4, 4);  // Left eye
    ctx.fillRect(bunny.x + bunny.width - 12, bunny.y + 8, 4, 4);  // Right eye
    
    // Draw nose with flashing effect
    ctx.fillStyle = `rgba(255, 182, 193, ${flashIntensity})`;  // Light pink color
    ctx.fillRect(bunny.x + bunny.width/2 - 2, bunny.y + 12, 4, 4);  // Nose
    
    // Draw mouth with expression based on lives
    ctx.strokeStyle = `rgba(0, 0, 0, ${flashIntensity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Calculate mouth expression based on lives
    const mouthRadius = 4;
    const mouthY = bunny.y + 16;
    const mouthX = bunny.x + bunny.width/2;
    
    if (lives === 3) {
        // Happy smile
        ctx.arc(mouthX, mouthY, mouthRadius, 0, Math.PI);
    } else if (lives === 2) {
        // Slightly worried (smaller smile)
        ctx.arc(mouthX, mouthY, mouthRadius * 0.7, 0, Math.PI);
    } else if (lives === 1) {
        // Worried (straight line)
        ctx.moveTo(mouthX - mouthRadius, mouthY);
        ctx.lineTo(mouthX + mouthRadius, mouthY);
    } else {
        // Sad (frown)
        ctx.arc(mouthX, mouthY + 2, mouthRadius, Math.PI, 0);
    }
    
    ctx.stroke();
    
    // Restore canvas state after bunny rotation
    if (isDeathAnimation) {
        ctx.restore();
    }
    
    // Restore canvas position after screen shake
    if (screenShake > 0) {
        ctx.restore();
    }
}

// Start the game when the page loads
window.onload = init; 