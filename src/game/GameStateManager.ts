import { GameState, GameEvent, Bunny } from '../types/game';
import * as constants from './constants';

export class GameStateManager {
    private state: GameState;
    private eventListeners: Map<GameEvent, Set<() => void>> = new Map();

    constructor() {
        this.state = {
            score: 0,
            highScore: parseInt(localStorage.getItem('carrotJumpHighScore') || '0'),
            lives: constants.INITIAL_LIVES,
            scrollSpeed: constants.INITIAL_SCROLL_SPEED,
            gameStarted: false,
            gameOver: false,
            isNewHighScore: false,
            screenShake: 0,
            isSplashScreen: true,
            splashStartTime: Date.now(),
            gameOverStartTime: 0,
            deathAnimation: {
                startTime: 0,
                startY: 0,
                finalY: 0,
                isActive: false
            }
        };
    }

    public getState(): GameState {
        return { ...this.state };
    }

    public startGame(): void {
        this.state = {
            ...this.state,
            score: 0,
            lives: constants.INITIAL_LIVES,
            scrollSpeed: constants.INITIAL_SCROLL_SPEED,
            gameStarted: true,
            gameOver: false,
            isNewHighScore: false,
            screenShake: 0,
            isSplashScreen: false,
            deathAnimation: {
                startTime: 0,
                startY: 0,
                finalY: 0,
                isActive: false
            }
        };
        this.emit('gameStart');
    }

    public endGame(): void {
        this.state = {
            ...this.state,
            gameOver: true,
            gameOverStartTime: Date.now()
        };
        if (Math.floor(this.state.score / constants.SCORE_PER_CARROT) > this.state.highScore) {
            this.state.highScore = Math.floor(this.state.score / constants.SCORE_PER_CARROT);
            this.state.isNewHighScore = true;
            localStorage.setItem('carrotJumpHighScore', this.state.highScore.toString());
        }
        this.emit('gameOver');
    }

    public updateScore(points: number): void {
        this.state.score += points;
        this.emit('scoreUpdate');
    }

    public setScreenShake(duration: number): void {
        this.state.screenShake = duration;
    }

    public loseLife(): void {
        this.state.lives--;
        this.setScreenShake(constants.SHAKE_DURATION);
        this.emit('livesUpdate');
        if (this.state.lives <= 0) {
            this.endGame();
        }
    }

    public startDeathAnimation(bunny: Bunny, finalY: number): void {
        bunny.velocityY = constants.JUMP_FORCE;  // Same initial velocity as a normal jump
        this.state.deathAnimation = {
            startTime: Date.now(),
            startY: bunny.y,
            finalY,
            isActive: true
        };
        this.emit('death');
    }

    public updateScreenShake(): void {
        if (this.state.screenShake > 0) {
            this.state.screenShake -= constants.FRAME_TIME;
        }
    }

    public updateGameOverScrollSpeed(): void {
        if (this.state.gameOver && this.state.scrollSpeed > 0) {
            // Gradually slow down to 0 over 1 second
            this.state.scrollSpeed = Math.max(0, this.state.scrollSpeed - (constants.INITIAL_SCROLL_SPEED / (1000 / constants.FRAME_TIME)));
        }
    }

    public increaseScrollSpeed(): void {
        this.state.scrollSpeed += constants.SPEED_INCREASE_PER_CARROT;
    }

    public addEventListener(event: GameEvent, callback: () => void): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event)!.add(callback);
    }

    public removeEventListener(event: GameEvent, callback: () => void): void {
        this.eventListeners.get(event)?.delete(callback);
    }

    private emit(event: GameEvent): void {
        this.eventListeners.get(event)?.forEach(callback => callback());
    }

    public canRestart(): boolean {
        if (!this.state.gameOver) return false;
        return Date.now() - this.state.gameOverStartTime >= 2000; // 2 seconds delay
    }

    public resetHighScore(): void {
        this.state = {
            ...this.state,
            highScore: 0,
            isNewHighScore: false
        };
        localStorage.setItem('carrotJumpHighScore', '0');
        this.emit('highScoreUpdate');
    }
} 