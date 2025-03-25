import { Bunny } from '../types/game';
import * as constants from './constants';
import { GameStateManager } from './GameStateManager';

export class InputManager {
    private bunny: Bunny;
    private onJump: () => void;
    private onGameStart: () => void;
    private onGameRestart: () => void;
    private onResetHighScore: () => void;
    private isSplashScreen: boolean = true;
    private stateManager: GameStateManager;

    constructor(
        bunny: Bunny,
        stateManager: GameStateManager,
        onJump: () => void,
        onGameStart: () => void,
        onGameRestart: () => void,
        onResetHighScore: () => void
    ) {
        this.bunny = bunny;
        this.stateManager = stateManager;
        this.onJump = onJump;
        this.onGameStart = onGameStart;
        this.onGameRestart = onGameRestart;
        this.onResetHighScore = onResetHighScore;
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        document.addEventListener('keydown', (event) => this.handleKeyPress(event));
        document.getElementById('restartButton')?.addEventListener('click', () => this.onGameRestart());
        document.getElementById('highScore')?.addEventListener('dblclick', () => this.onResetHighScore());
    }

    private handleKeyPress(event: KeyboardEvent): void {
        if (this.isSplashScreen) {
            if (event.code === 'Space') {
                this.isSplashScreen = false;
                this.onGameStart();
            }
            return;
        }

        // Check if the game is over
        if (this.stateManager.getState().gameOver) {
            if (event.code === 'Space' && this.stateManager.canRestart()) {
                this.onGameRestart();
            }
            return;
        }

        if (event.code === 'Space') {
            if (!this.bunny.isJumping) {
                this.bunny.velocityY = constants.JUMP_FORCE;
                this.bunny.isJumping = true;
                this.onJump();
            } else if (this.bunny.canDoubleJump) {
                this.bunny.velocityY = constants.JUMP_FORCE;
                this.bunny.canDoubleJump = false;
                this.onJump();
            }
        }
    }

    public handleGameOver(event: KeyboardEvent): void {
        if (event.code === 'Enter') {
            const restartButton = document.getElementById('restartButton') as HTMLButtonElement;
            if (!restartButton.disabled) {
                this.onGameRestart();
            }
        }
    }

    public cleanup(): void {
        document.removeEventListener('keydown', this.handleKeyPress);
    }
} 