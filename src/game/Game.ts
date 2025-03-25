import { Bunny, Particle } from '../types/game';
import { SoundManager } from './SoundManager';
import { Particle as ParticleClass } from './Particle';
import { Renderer } from './Renderer';
import { ObjectManager } from './ObjectManager';
import { PhysicsManager } from './PhysicsManager';
import { GameStateManager } from './GameStateManager';
import { InputManager } from './InputManager';
import * as constants from './constants';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private gameLoop: number | null = null;
    private soundManager: SoundManager;
    private renderer: Renderer;
    private objectManager: ObjectManager;
    private physicsManager: PhysicsManager;
    private stateManager: GameStateManager;
    private inputManager: InputManager;
    private bunny: Bunny;
    private particles: Particle[] = [];

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        
        // Set canvas size
        this.canvas.width = constants.CANVAS_WIDTH;
        this.canvas.height = constants.CANVAS_HEIGHT;
        
        // Initialize managers
        this.soundManager = new SoundManager();
        this.stateManager = new GameStateManager();
        this.renderer = new Renderer(this.ctx);
        this.objectManager = new ObjectManager(this.stateManager);
        this.physicsManager = new PhysicsManager();

        // Hide score elements initially
        const scoreElement = document.getElementById('score');
        const highScoreElement = document.getElementById('highScore');
        const livesElement = document.getElementById('lives');
        if (scoreElement) scoreElement.style.display = 'none';
        if (highScoreElement) highScoreElement.style.display = 'none';
        if (livesElement) livesElement.style.display = 'none';

        // Initialize bunny
        this.bunny = {
            x: constants.DEFAULT_BUNNY_X,
            y: constants.CANVAS_HEIGHT - constants.GROUND_HEIGHT - constants.BUNNY_HEIGHT,
            width: constants.BUNNY_WIDTH,
            height: constants.BUNNY_HEIGHT,
            velocityY: 0,
            isJumping: false,
            canDoubleJump: true,
            invulnerable: false,
            rotation: 0
        };

        // Initialize input manager
        this.inputManager = new InputManager(
            this.bunny,
            this.stateManager,
            () => this.soundManager.playSound('jump'),
            () => this.startGame(),
            () => this.restartGame(),
            () => this.resetHighScore()
        );

        // Set up event listeners
        this.setupEventListeners();
        
        // Start the game loop
        this.gameLoop = window.setInterval(() => this.update(), constants.FRAME_TIME);
    }

    private setupEventListeners(): void {
        this.stateManager.addEventListener('gameStart', () => {
            // No need to remove DOM element since we're using canvas-based splash screen
        });

        this.stateManager.addEventListener('gameOver', () => {
            this.showGameOver();
        });

        this.stateManager.addEventListener('scoreUpdate', () => {
            this.objectManager.setScore(this.stateManager.getState().score);
            this.stateManager.increaseScrollSpeed();
        });

        this.stateManager.addEventListener('livesUpdate', () => {
            this.updateLivesDisplay();
        });

        this.stateManager.addEventListener('highScoreUpdate', () => {
            const highScoreElement = document.getElementById('highScore');
            if (highScoreElement) {
                highScoreElement.textContent = `High Score: ${this.stateManager.getState().highScore}`;
            }
        });
    }

    private updateLivesDisplay(): void {
        const livesContainer = document.getElementById('lives');
        if (!livesContainer) return;

        livesContainer.innerHTML = ''; // Clear existing hearts
        
        // Create hearts based on remaining lives
        const lives = this.stateManager.getState().lives;
        for (let i = 0; i < constants.INITIAL_LIVES; i++) {
            const heart = document.createElement('div');
            heart.className = 'heart';
            // Add the middle triangle element
            const middle = document.createElement('div');
            middle.className = 'middle';
            heart.appendChild(middle);
            livesContainer.appendChild(heart);

            // Only flash the heart that is being lost
            if (i === lives) {
                heart.classList.add('flashing');
                setTimeout(() => {
                    heart.classList.remove('flashing');
                    heart.classList.add('empty'); // Turn grey after flashing
                }, 1000); // Flash for 1 second
            } else if (i > lives) {
                heart.classList.add('empty'); // Already lost hearts are grey
            }
        }
    }

    private update(): void {
        const state = this.stateManager.getState();

        if (state.isSplashScreen) {
            this.renderer.drawSplashScreen();
            return;
        }

        // Update screen shake
        this.stateManager.updateScreenShake();

        // Update scroll speed during game over
        this.stateManager.updateGameOverScrollSpeed();

        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            return particle.life > 0;
        });

        // Handle death animation
        if (state.deathAnimation.isActive) {
            this.physicsManager.updateDeathAnimation(this.bunny, state.deathAnimation);
        } else if (!state.gameOver) {
            // Only update normal game physics if not game over
            this.physicsManager.updateBunnyPhysics(this.bunny);

            // Check platform collisions
            for (const platform of this.objectManager.getPlatforms()) {
                this.physicsManager.handlePlatformCollision(this.bunny, platform);
            }

            // Check obstacle collisions
            for (const obstacle of this.objectManager.getObstacles()) {
                if (this.physicsManager.isColliding(this.bunny, obstacle) && !this.bunny.invulnerable) {
                    this.handlePlayerDeath();
                    return;
                }
            }

            // Check carrot collisions
            const carrots = this.objectManager.getCarrots();
            for (let i = carrots.length - 1; i >= 0; i--) {
                const carrot = carrots[i];
                if (this.physicsManager.isColliding(this.bunny, carrot)) {
                    this.soundManager.playSound('carrot');
                    this.stateManager.updateScore(constants.SCORE_PER_CARROT);
                    this.objectManager.removeCarrot(i);
                }
            }

            // Check if bunny is out of bounds
            if (this.physicsManager.isOutOfBounds(this.bunny)) {
                this.handlePlayerDeath();
            }
        }

        // Spawn and update game objects
        if (!state.gameOver) {
            this.objectManager.spawnObstacle();
            this.objectManager.spawnCarrot();
            this.objectManager.spawnPlatform();
        }
        this.objectManager.update(state.scrollSpeed);

        // Draw everything
        this.renderer.clear();
        this.renderer.applyScreenShake(state.screenShake);
        this.renderer.drawGround();
        this.renderer.drawBunny(this.bunny, state.lives, this.bunny.invulnerable);
        this.objectManager.getObstacles().forEach(obstacle => this.renderer.drawObstacle(obstacle));
        this.objectManager.getCarrots().forEach(carrot => this.renderer.drawCarrot(carrot));
        this.objectManager.getPlatforms().forEach(platform => this.renderer.drawPlatform(platform));
        this.particles.forEach(particle => this.renderer.drawParticle(particle));

        // Update score display using DOM elements
        const scoreElement = document.getElementById('score');
        const highScoreElement = document.getElementById('highScore');
        const livesElement = document.getElementById('lives');
        
        // Hide score elements during splash screen
        if (state.isSplashScreen) {
            if (scoreElement) scoreElement.style.display = 'none';
            if (highScoreElement) highScoreElement.style.display = 'none';
            if (livesElement) livesElement.style.display = 'none';
        } else {
            if (scoreElement) {
                scoreElement.style.display = 'block';
                scoreElement.textContent = `Score: ${Math.floor(state.score / constants.SCORE_PER_CARROT)}`;
            }
            if (highScoreElement) {
                highScoreElement.style.display = 'block';
                highScoreElement.textContent = `High Score: ${state.highScore}`;
            }
            if (livesElement) livesElement.style.display = 'block';
        }

        if (state.gameOver) {
            this.renderer.drawGameOver(state);
        }
    }

    private handlePlayerDeath(): void {
        // Create hit particles
        for (let i = 0; i < constants.PARTICLE_COUNT; i++) {
            this.particles.push(new ParticleClass(
                this.bunny.x + this.bunny.width/2,
                this.bunny.y + this.bunny.height/2
            ));
        }

        // Play hit sound
        this.soundManager.playSound('hit');

        // Update lives first
        this.stateManager.loseLife();

        // Handle remaining lives or death
        if (this.stateManager.getState().lives > 0) {
            this.bunny.x = constants.DEFAULT_BUNNY_X;
            this.bunny.y = constants.CANVAS_HEIGHT - constants.GROUND_HEIGHT - constants.BUNNY_HEIGHT;
            this.bunny.velocityY = 0;
            this.bunny.isJumping = false;
            this.bunny.canDoubleJump = true;
            this.bunny.invulnerable = true;

            setTimeout(() => {
                this.bunny.invulnerable = false;
            }, constants.INVULNERABILITY_DURATION);
        } else {
            this.soundManager.playSound('death');
            // Add a slight delay before playing the game over sound
            setTimeout(() => {
                this.soundManager.playSound('gameOver');
            }, 200); // Reduced from 300ms to 200ms
            this.stateManager.startDeathAnimation(
                this.bunny,
                constants.CANVAS_HEIGHT - constants.GROUND_HEIGHT - constants.BUNNY_HEIGHT
            );
        }
    }

    private startGame(): void {
        this.stateManager.startGame();
        this.objectManager.clear();
        this.particles = [];
        this.soundManager.reset();
        
        // Reset bunny position and state
        this.bunny.x = constants.DEFAULT_BUNNY_X;
        this.bunny.y = constants.CANVAS_HEIGHT - constants.GROUND_HEIGHT - constants.BUNNY_HEIGHT;
        this.bunny.velocityY = 0;
        this.bunny.isJumping = false;
        this.bunny.canDoubleJump = true;
        this.bunny.rotation = 0;

        // Show score elements
        const scoreElement = document.getElementById('score');
        const highScoreElement = document.getElementById('highScore');
        const livesElement = document.getElementById('lives');
        if (scoreElement) scoreElement.style.display = 'block';
        if (highScoreElement) highScoreElement.style.display = 'block';
        if (livesElement) livesElement.style.display = 'block';

        // Initialize lives display
        this.updateLivesDisplay();
    }

    private restartGame(): void {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        this.startGame();
        this.gameLoop = window.setInterval(() => this.update(), constants.FRAME_TIME);
    }

    private resetHighScore(): void {
        this.stateManager.resetHighScore();
    }

    private showGameOver(): void {
        // No need for DOM manipulation anymore
        // The game over screen is now drawn on the canvas
    }

    public cleanup(): void {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        this.inputManager.cleanup();
    }
} 