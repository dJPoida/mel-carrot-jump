import { Bunny, GameObject, Platform } from '../types/game';
import * as constants from './constants';

export class PhysicsManager {
    public updateBunnyPhysics(bunny: Bunny): void {
        bunny.velocityY += constants.GRAVITY;
        bunny.y += bunny.velocityY;

        // Return bunny to default x position
        if (bunny.x !== constants.DEFAULT_BUNNY_X) {
            if (bunny.x < constants.DEFAULT_BUNNY_X) {
                bunny.x += constants.RETURN_TO_CENTER_SPEED;
            } else {
                bunny.x -= constants.RETURN_TO_CENTER_SPEED;
            }
        }

        // Ground collision
        if (bunny.y > constants.CANVAS_HEIGHT - constants.GROUND_HEIGHT - constants.BUNNY_HEIGHT) {
            bunny.y = constants.CANVAS_HEIGHT - constants.GROUND_HEIGHT - constants.BUNNY_HEIGHT;
            bunny.velocityY = 0;
            bunny.isJumping = false;
            bunny.canDoubleJump = true;
        }
    }

    public handlePlatformCollision(bunny: Bunny, platform: Platform): boolean {
        if (this.isColliding(bunny, platform)) {
            // Check if bunny is falling and above the platform
            if (bunny.velocityY > 0 && 
                bunny.y + bunny.height - bunny.velocityY <= platform.y) {
                bunny.y = platform.y - bunny.height;
                bunny.velocityY = 0;
                bunny.isJumping = false;
                bunny.canDoubleJump = true;
                return true;
            }
        }
        return false;
    }

    public updateDeathAnimation(bunny: Bunny, deathAnimation: { startTime: number; startY: number; finalY: number; isActive: boolean }): void {
        if (!deathAnimation.isActive) return;

        const elapsed = (Date.now() - deathAnimation.startTime) / 1000;
        
        // Apply the same jump physics as regular gameplay
        bunny.velocityY += constants.GRAVITY;
        bunny.y += bunny.velocityY;

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