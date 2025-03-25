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
    private keydownHandler: (event: KeyboardEvent) => void;
    private mousedownHandler: () => void;
    private touchstartHandler: (event: TouchEvent) => void;

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
        
        // Store event handlers
        this.keydownHandler = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                this.handleButtonPress();
            }
        };
        this.mousedownHandler = () => this.handleButtonPress();
        this.touchstartHandler = (event: TouchEvent) => {
            event.preventDefault();
            this.handleButtonPress();
        };
        
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Keyboard events
        document.addEventListener('keydown', this.keydownHandler);
        
        // Mouse events
        document.addEventListener('mousedown', (event) => {
            // Don't trigger if clicking on high score
            if (event.target instanceof HTMLElement && event.target.id === 'highScore') {
                return;
            }
            this.handleButtonPress();
        });
        
        // Touch events
        document.addEventListener('touchstart', (event) => {
            event.preventDefault(); // Prevent scrolling on mobile
            // Don't trigger if touching high score
            if (event.target instanceof HTMLElement && event.target.id === 'highScore') {
                return;
            }
            this.handleButtonPress();
        });
        
        // UI events
        document.getElementById('restartButton')?.addEventListener('click', () => this.onGameRestart());
        document.getElementById('highScore')?.addEventListener('dblclick', () => this.onResetHighScore());
    }

    private handleButtonPress(): void {
        if (this.isSplashScreen) {
            this.isSplashScreen = false;
            this.onGameStart();
            return;
        }

        // Check if the game is over
        if (this.stateManager.getState().gameOver) {
            if (this.stateManager.canRestart()) {
                this.onGameRestart();
            }
            return;
        }

        // Handle jump
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

    public handleGameOver(event: KeyboardEvent): void {
        if (event.code === 'Enter') {
            const restartButton = document.getElementById('restartButton') as HTMLButtonElement;
            if (!restartButton.disabled) {
                this.onGameRestart();
            }
        }
    }

    public cleanup(): void {
        // Remove all event listeners
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('mousedown', this.mousedownHandler);
        document.removeEventListener('touchstart', this.touchstartHandler);
    }
} 