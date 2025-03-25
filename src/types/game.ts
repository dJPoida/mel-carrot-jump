import { SoundManager } from '../game/SoundManager';

// Base interfaces
export interface Vector2D {
    x: number;
    y: number;
}

export interface Dimensions {
    width: number;
    height: number;
}

export interface GameObject extends Vector2D, Dimensions {}

// Game entities
export interface Bunny extends GameObject {
    velocityY: number;
    isJumping: boolean;
    canDoubleJump: boolean;
    invulnerable: boolean;
    rotation: number;
}

export interface Obstacle extends GameObject {}

export interface Carrot extends GameObject {}

export interface Platform extends GameObject {}

export interface Particle extends GameObject {
    speedX: number;
    speedY: number;
    life: number;
    color: string;
    update(): void;
    draw(ctx: CanvasRenderingContext2D): void;
}

// Game state
export interface DeathAnimationState {
    startTime: number;
    startY: number;
    finalY: number;
    isActive: boolean;
}

export interface GameState {
    // Core game state
    score: number;
    highScore: number;
    lives: number;
    scrollSpeed: number;
    
    // Game flow state
    gameStarted: boolean;
    gameOver: boolean;
    isNewHighScore: boolean;
    
    // Visual effects
    screenShake: number;
    
    // UI state
    isSplashScreen: boolean;
    splashStartTime: number;
    gameOverStartTime: number;
    
    // Death animation
    deathAnimation: DeathAnimationState;
}

// Game configuration
export interface GameConfig {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    soundManager: SoundManager;
}

// Event types
export type GameEvent = 
    | 'gameStart'
    | 'gameOver'
    | 'scoreUpdate'
    | 'livesUpdate'
    | 'highScoreUpdate'
    | 'death'
    | 'carrotCollected'
    | 'obstacleHit'; 