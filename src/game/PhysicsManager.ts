import { Bunny, GameObject } from '../types/game';
import * as constants from './constants';

export class PhysicsManager {
    private lastPlatformCollision: GameObject | null = null;

    public updateBunnyPhysics(bunny: Bunny, deltaTime: number): void {
        // Apply gravity with delta time
        bunny.velocityY += constants.GRAVITY * (deltaTime / 16.67); // Normalize to 60fps
        bunny.y += bunny.velocityY * (deltaTime / 16.67);

        // Apply return to center force
        const centerX = constants.DEFAULT_BUNNY_X;
        const distanceFromCenter = centerX - bunny.x;
        if (Math.abs(distanceFromCenter) > 1) {
            bunny.x += distanceFromCenter * constants.RETURN_TO_CENTER_SPEED * (deltaTime / 16.67);
        } else {
            bunny.x = centerX;
        }

        // Ground collision
        if (bunny.y > constants.CANVAS_HEIGHT - constants.GROUND_HEIGHT - bunny.height) {
            bunny.y = Math.round(constants.CANVAS_HEIGHT - constants.GROUND_HEIGHT - bunny.height);
            bunny.velocityY = 0;
            bunny.isJumping = false;
            bunny.canDoubleJump = true;
        }
    }

    public handlePlatformCollision(bunny: Bunny, platform: GameObject): boolean {
        if (this.isColliding(bunny, platform)) {
            // Calculate overlap on each side
            const overlapLeft = (bunny.x + bunny.width) - platform.x;
            const overlapRight = (platform.x + platform.width) - bunny.x;
            const overlapTop = (bunny.y + bunny.height) - platform.y;
            const overlapBottom = (platform.y + platform.height) - bunny.y;

            // Find the smallest overlap
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            // Resolve collision based on the smallest overlap
            if (minOverlap === overlapTop) {
                // Collision from above (landing)
                bunny.y = Math.round(platform.y - bunny.height);
                bunny.velocityY = 0;
                bunny.isJumping = false;
                bunny.canDoubleJump = true;
                this.lastPlatformCollision = platform;
                return true;
            } else if (minOverlap === overlapBottom) {
                // Collision from below (hitting head)
                bunny.y = Math.round(platform.y + platform.height);
                bunny.velocityY = 0;
                return true;
            } else if (minOverlap === overlapLeft) {
                // Collision from left
                bunny.x = Math.round(platform.x - bunny.width);
                return true;
            } else if (minOverlap === overlapRight) {
                // Collision from right
                bunny.x = Math.round(platform.x + platform.width);
                return true;
            }
        } else if (this.lastPlatformCollision === platform) {
            // If we're no longer colliding with the last platform we were on,
            // and we're not jumping, start falling
            if (!bunny.isJumping && bunny.velocityY === 0) {
                bunny.velocityY = 0.1; // Small initial velocity to start falling
                this.lastPlatformCollision = null;
            }
        }
        return false;
    }

    public updateDeathAnimation(bunny: Bunny, deathAnimation: { startTime: number; startY: number; finalY: number; isActive: boolean }, deltaTime: number): void {
        if (!deathAnimation.isActive) return;

        const elapsed = (Date.now() - deathAnimation.startTime) / 1000;
        
        // Apply the same jump physics as regular gameplay with delta time
        bunny.velocityY += constants.GRAVITY * (deltaTime / 16.67);
        bunny.y += bunny.velocityY * (deltaTime / 16.67);

        // Stop at ground level
        if (bunny.y > deathAnimation.finalY) {
            bunny.y = deathAnimation.finalY;
            bunny.velocityY = 0;
        }
        
        // Create a smooth rotation that starts fast and slows down
        const rotationProgress = Math.min(elapsed * constants.DEATH_ROTATION_SPEED, 1);
        const rotationEasing = 1 - Math.pow(1 - rotationProgress, 2);
        bunny.rotation = rotationEasing * constants.DEATH_FINAL_ROTATION;
    }

    public isColliding(rect1: GameObject, rect2: GameObject): boolean {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    public isOutOfBounds(bunny: Bunny): boolean {
        return bunny.y > constants.CANVAS_HEIGHT;
    }
} 