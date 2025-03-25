import { Obstacle, Carrot, Platform, GameObject } from '../types/game';
import * as constants from './constants';
import { GameStateManager } from './GameStateManager';

export class ObjectManager {
    private obstacles: Obstacle[] = [];
    private carrots: Carrot[] = [];
    private platforms: Platform[] = [];
    private currentScore: number = 0;
    private stateManager: GameStateManager;

    constructor(stateManager: GameStateManager) {
        this.stateManager = stateManager;
    }

    public spawnObstacle(): void {
        const spawnRate = constants.INITIAL_OBSTACLE_SPAWN_RATE + 
            (Math.floor(this.currentScore / constants.SCORE_PER_CARROT) * constants.OBSTACLE_SPAWN_RATE_INCREASE);

        if (Math.random() < spawnRate) {
            this.obstacles.push({
                x: constants.CANVAS_WIDTH,
                y: constants.CANVAS_HEIGHT - constants.GROUND_HEIGHT - constants.OBSTACLE_HEIGHT,
                width: constants.OBSTACLE_WIDTH / 2, // Make spikes half width
                height: constants.OBSTACLE_HEIGHT
            });
        }
    }

    public spawnCarrot(): void {
        if (Math.random() < constants.INITIAL_CARROT_SPAWN_RATE) {
            const height = Math.random() * 
                (constants.CARROT_MAX_HEIGHT - constants.CARROT_MIN_HEIGHT) + 
                constants.CARROT_MIN_HEIGHT;

            this.carrots.push({
                x: constants.CANVAS_WIDTH,
                y: constants.CANVAS_HEIGHT - constants.GROUND_HEIGHT - height,
                width: constants.CARROT_WIDTH,
                height: constants.CARROT_HEIGHT
            });
        }
    }

    public spawnPlatform(): void {
        const state = this.stateManager.getState();
        if (!state.gameStarted || state.gameOver) return;

        // Calculate the rightmost platform position
        const rightmostPlatform = this.platforms.reduce((rightmost, platform) => 
            Math.max(rightmost, platform.x), -constants.PLATFORM_WIDTH
        );

        // If we're too far from the rightmost platform, spawn a new one
        const distanceFromRightmost = constants.CANVAS_WIDTH - rightmostPlatform;
        const shouldSpawn = distanceFromRightmost > constants.PLATFORM_WIDTH * 2;

        if (shouldSpawn) {
            const newPlatformX = constants.CANVAS_WIDTH;
            const minHeightFromGround = constants.OBSTACLE_HEIGHT * 2;
            const maxHeight = constants.CANVAS_HEIGHT - constants.GROUND_HEIGHT - constants.PLATFORM_HEIGHT - minHeightFromGround;
            const newPlatformY = Math.random() * (maxHeight - 100) + 100;
            const minGap = constants.PLATFORM_WIDTH * constants.PLATFORM_MIN_GAP;

            // Randomly select platform width
            const platformWidths = [
                constants.PLATFORM_MIN_WIDTH,  // Half length
                constants.PLATFORM_WIDTH,      // Normal length
                constants.PLATFORM_MAX_WIDTH   // 1.5x length
            ];
            const selectedWidth = platformWidths[Math.floor(Math.random() * platformWidths.length)];

            // Check for horizontal overlap with existing platforms
            const hasOverlap = this.platforms.some(platform => {
                const platformRight = platform.x + platform.width;
                const newPlatformLeft = newPlatformX;
                const newPlatformRight = newPlatformX + selectedWidth;
                return !(newPlatformRight + minGap < platform.x || newPlatformLeft > platformRight + minGap);
            });

            if (!hasOverlap) {
                this.platforms.push({
                    x: newPlatformX,
                    y: newPlatformY,
                    width: selectedWidth,
                    height: constants.PLATFORM_HEIGHT
                });
            }
        }
    }

    public update(scrollSpeed: number): void {
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.x -= scrollSpeed;
            return obstacle.x > -obstacle.width;
        });

        this.carrots = this.carrots.filter(carrot => {
            carrot.x -= scrollSpeed;
            return carrot.x > -carrot.width;
        });

        this.platforms = this.platforms.filter(platform => {
            platform.x -= scrollSpeed;
            return platform.x > -platform.width;
        });
    }

    public setScore(score: number): void {
        this.currentScore = score;
    }

    public getObstacles(): Obstacle[] {
        return this.obstacles;
    }

    public getCarrots(): Carrot[] {
        return this.carrots;
    }

    public removeCarrot(index: number): void {
        this.carrots.splice(index, 1);
    }

    public getPlatforms(): Platform[] {
        return this.platforms;
    }

    public clear(): void {
        this.obstacles = [];
        this.carrots = [];
        this.platforms = [];
        this.currentScore = 0;
    }

    private isValidSpawnPosition(x: number, y: number, width: number, height: number): boolean {
        const newObject: GameObject = { x, y, width, height };

        // Check collision with existing platforms
        for (const platform of this.platforms) {
            if (this.isColliding(newObject, platform)) {
                return false;
            }
        }

        // Check collision with existing obstacles
        for (const obstacle of this.obstacles) {
            if (this.isColliding(newObject, obstacle)) {
                return false;
            }
        }

        // Check collision with existing carrots
        for (const carrot of this.carrots) {
            if (this.isColliding(newObject, carrot)) {
                return false;
            }
        }

        return true;
    }

    private isColliding(rect1: GameObject, rect2: GameObject): boolean {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
} 