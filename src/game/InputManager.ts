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
    private keyupHandler: (event: KeyboardEvent) => void;
    private mousedownHandler: (event: MouseEvent) => void;
    private mouseupHandler: (event: MouseEvent) => void;
    private touchstartHandler: (event: TouchEvent) => void;
    private touchendHandler: (event: TouchEvent) => void;
    private isKeyPressed: boolean = false;
    private isTouchActive: boolean = false;
    private lastJumpTime: number = 0;
    private readonly JUMP_DEBOUNCE_TIME: number = 200; // Minimum time between jumps in ms

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
            if (event.code === 'Space' && !this.isKeyPressed) {
                this.isKeyPressed = true;
                this.handleButtonPress();
            }
        };

        this.keyupHandler = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                this.isKeyPressed = false;
            }
        };

        this.mousedownHandler = (_event: MouseEvent) => {
            if (!this.isTouchActive) {
                this.handleButtonPress();
            }
        };

        this.mouseupHandler = (_event: MouseEvent) => {
            this.isTouchActive = false;
        };

        this.touchstartHandler = (event: TouchEvent) => {
            event.preventDefault();
            if (!this.isTouchActive) {
                this.isTouchActive = true;
                this.handleButtonPress();
            }
        };

        this.touchendHandler = (event: TouchEvent) => {
            event.preventDefault();
            this.isTouchActive = false;
        };
        
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        // Keyboard events
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
        
        // Mouse events
        document.addEventListener('mousedown', (event) => {
            // Don't trigger if clicking on high score
            if (event.target instanceof HTMLElement && event.target.id === 'highScore') {
                return;
            }
            this.mousedownHandler(event);
        });
        document.addEventListener('mouseup', this.mouseupHandler);
        
        // Touch events
        document.addEventListener('touchstart', (event) => {
            event.preventDefault(); // Prevent scrolling on mobile
            // Don't trigger if touching high score
            if (event.target instanceof HTMLElement && event.target.id === 'highScore') {
                return;
            }
            this.touchstartHandler(event);
        });
        document.addEventListener('touchend', this.touchendHandler);
        
        // UI events
        document.getElementById('restartButton')?.addEventListener('click', () => this.onGameRestart());
        document.getElementById('highScore')?.addEventListener('dblclick', () => this.onResetHighScore());
    }

    private handleButtonPress(): void {
        const currentTime = Date.now();
        if (currentTime - this.lastJumpTime < this.JUMP_DEBOUNCE_TIME) {
            return; // Ignore the press if it's too soon after the last jump
        }

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
            this.lastJumpTime = currentTime;
        } else if (this.bunny.canDoubleJump) {
            this.bunny.velocityY = constants.JUMP_FORCE;
            this.bunny.canDoubleJump = false;
            this.onJump();
            this.lastJumpTime = currentTime;
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
        document.removeEventListener('keyup', this.keyupHandler);
        document.removeEventListener('mousedown', this.mousedownHandler);
        document.removeEventListener('mouseup', this.mouseupHandler);
        document.removeEventListener('touchstart', this.touchstartHandler);
        document.removeEventListener('touchend', this.touchendHandler);
    }
} 