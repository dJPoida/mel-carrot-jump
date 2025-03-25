import { Bunny, Obstacle, Carrot, Platform, Particle, GameState } from '../types/game';
import * as constants from './constants';

export class Renderer {
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
        this.canvas = ctx.canvas;
    }

    public clear(): void {
        this.ctx.clearRect(0, 0, constants.CANVAS_WIDTH, constants.CANVAS_HEIGHT);
    }

    public drawGround(): void {
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fillRect(0, constants.CANVAS_HEIGHT - constants.GROUND_HEIGHT, 
            constants.CANVAS_WIDTH, constants.GROUND_HEIGHT);
    }

    public drawBunny(bunny: Bunny, lives: number, isInvulnerable: boolean): void {
        this.ctx.save();
        this.ctx.translate(bunny.x + bunny.width / 2, bunny.y + bunny.height / 2);
        this.ctx.rotate(bunny.rotation);
        this.ctx.translate(-(bunny.x + bunny.width / 2), -(bunny.y + bunny.height / 2));

        // Apply invulnerability flash effect
        if (isInvulnerable) {
            const opacity = Math.floor(Date.now() / constants.FLASH_SPEED) % 2 === 0 
                ? constants.FLASH_OPACITY.VISIBLE 
                : constants.FLASH_OPACITY.FADED;
            this.ctx.globalAlpha = opacity;
        }

        // Draw bunny body
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(bunny.x, bunny.y, bunny.width, bunny.height);

        // Draw bunny ears
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(bunny.x - 4, bunny.y - 8, 8, 16);
        this.ctx.fillRect(bunny.x + bunny.width - 4, bunny.y - 8, 8, 16);

        // Draw bunny eyes
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(bunny.x + 8, bunny.y + 8, 4, 4);
        this.ctx.fillRect(bunny.x + bunny.width - 12, bunny.y + 8, 4, 4);

        // Draw bunny nose
        this.ctx.fillStyle = '#FFB6C1';
        this.ctx.fillRect(bunny.x + bunny.width / 2 - 2, bunny.y + 12, 4, 4);

        // Draw bunny mouth based on lives
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        const mouthY = bunny.y + 16;
        const mouthX = bunny.x + bunny.width / 2;

        if (lives === 3) {
            this.ctx.arc(mouthX, mouthY, 4, 0, Math.PI);
        } else if (lives === 2) {
            this.ctx.arc(mouthX, mouthY, 2.8, 0, Math.PI);
        } else if (lives === 1) {
            this.ctx.moveTo(mouthX - 4, mouthY);
            this.ctx.lineTo(mouthX + 4, mouthY);
        } else {
            this.ctx.arc(mouthX, mouthY + 2, 4, Math.PI, 0);
        }
        this.ctx.stroke();

        this.ctx.restore();
    }

    public drawObstacle(obstacle: Obstacle): void {
        // Create metallic gradient for the spike
        const gradient = this.ctx.createLinearGradient(
            obstacle.x, 
            obstacle.y, 
            obstacle.x + obstacle.width, 
            obstacle.y + obstacle.height
        );
        gradient.addColorStop(0, '#C0C0C0');   // Silver base
        gradient.addColorStop(0.3, '#FFFFFF'); // Highlight
        gradient.addColorStop(0.7, '#A0A0A0'); // Shadow
        gradient.addColorStop(1, '#808080');   // Dark edge

        // Draw spike body with gradient
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
        this.ctx.lineTo(obstacle.x + obstacle.width/2, obstacle.y);
        this.ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
        this.ctx.closePath();
        this.ctx.fill();

        // Add metallic shine effect
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
        this.ctx.lineTo(obstacle.x + obstacle.width/4, obstacle.y + obstacle.height/2);
        this.ctx.lineTo(obstacle.x + obstacle.width/2, obstacle.y);
        this.ctx.closePath();
        this.ctx.fill();

        // Add spike details
        this.ctx.strokeStyle = '#808080';
        this.ctx.lineWidth = 1;
        
        // Draw spike edges
        this.ctx.beginPath();
        this.ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
        this.ctx.lineTo(obstacle.x + obstacle.width/2, obstacle.y);
        this.ctx.moveTo(obstacle.x + obstacle.width/2, obstacle.y);
        this.ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
        this.ctx.stroke();

        // Add spike tip highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.beginPath();
        this.ctx.moveTo(obstacle.x + obstacle.width/2, obstacle.y);
        this.ctx.lineTo(obstacle.x + obstacle.width/2 + 2, obstacle.y + 4);
        this.ctx.lineTo(obstacle.x + obstacle.width/2 - 2, obstacle.y + 4);
        this.ctx.closePath();
        this.ctx.fill();
    }

    public drawCarrot(carrot: Carrot): void {
        // Draw carrot body with gradient
        const gradient = this.ctx.createLinearGradient(
            carrot.x,
            carrot.y,
            carrot.x + carrot.width,
            carrot.y + carrot.height
        );
        gradient.addColorStop(0, '#FF8C00');  // Dark orange at top
        gradient.addColorStop(0.5, '#FFA500'); // Orange in middle
        gradient.addColorStop(1, '#FF6B00');   // Light orange at bottom

        // Draw carrot body (pointing downward)
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.moveTo(carrot.x, carrot.y); // Left top
        this.ctx.lineTo(carrot.x + carrot.width, carrot.y); // Right top
        this.ctx.lineTo(carrot.x + carrot.width/2, carrot.y + carrot.height); // Point at bottom
        this.ctx.closePath();
        this.ctx.fill();

        // Draw carrot leaves at the top
        this.ctx.fillStyle = '#228B22'; // Forest green
        const leafCount = 3;
        const leafLength = carrot.width * 0.8;
        const leafWidth = carrot.width * 0.3;
        
        for (let i = 0; i < leafCount; i++) {
            const angle = (i - 1) * Math.PI / 4; // Spread leaves out
            this.ctx.save();
            this.ctx.translate(carrot.x + carrot.width/2, carrot.y);
            this.ctx.rotate(angle);
            
            // Draw leaf
            this.ctx.beginPath();
            this.ctx.moveTo(0, 0);
            this.ctx.quadraticCurveTo(leafWidth/2, -leafLength/2, 0, -leafLength);
            this.ctx.quadraticCurveTo(-leafWidth/2, -leafLength/2, 0, 0);
            this.ctx.fill();
            
            this.ctx.restore();
        }

        // Add shine effect at the top
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.moveTo(carrot.x + carrot.width/2, carrot.y);
        this.ctx.lineTo(carrot.x + carrot.width/2 + 2, carrot.y + 4);
        this.ctx.lineTo(carrot.x + carrot.width/2 - 2, carrot.y + 4);
        this.ctx.closePath();
        this.ctx.fill();
    }

    public drawPlatform(platform: Platform): void {
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }

    public drawParticle(particle: Particle): void {
        particle.draw(this.ctx);
    }

    public drawGameOver(state: GameState): void {
        // Draw semi-transparent black background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, constants.CANVAS_WIDTH, constants.CANVAS_HEIGHT);

        // Draw game over text
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.font = '24px "Press Start 2P", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        const gameOverText = state.isNewHighScore ? 'New High Score! 🎉' : 'You are a bunny kebab! 🍖';
        this.ctx.fillText(gameOverText, constants.CANVAS_WIDTH / 2, constants.CANVAS_HEIGHT / 2);

        // Draw restart instructions only after 2 seconds
        if (state.gameOverStartTime > 0 && Date.now() - state.gameOverStartTime >= 2000) {
            this.ctx.font = '16px "Press Start 2P", monospace';
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillText('Press SPACE to Restart', constants.CANVAS_WIDTH / 2, constants.CANVAS_HEIGHT / 2 + 60);
        }
    }

    public drawSplashScreen(): void {
        // Clear the canvas first
        this.clear();

        // Draw background
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, constants.CANVAS_WIDTH, constants.CANVAS_HEIGHT);

        // Draw scanlines
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let y = 0; y < constants.CANVAS_HEIGHT; y += 4) {
            this.ctx.fillRect(0, y, constants.CANVAS_WIDTH, 2);
        }

        // Draw CRT screen effect
        const gradient = this.ctx.createRadialGradient(
            constants.CANVAS_WIDTH / 2, constants.CANVAS_HEIGHT / 2, 0,
            constants.CANVAS_WIDTH / 2, constants.CANVAS_HEIGHT / 2, constants.CANVAS_WIDTH / 2
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, constants.CANVAS_WIDTH, constants.CANVAS_HEIGHT);

        // Draw title with retro effect
        this.ctx.font = `bold ${constants.SPLASH_TITLE_FONT_SIZE}px "VT323", monospace`;
        this.ctx.textAlign = 'center';
        
        // Draw title shadow with offset
        this.ctx.fillStyle = '#000000';
        this.ctx.fillText('CARROT JUMP', constants.CANVAS_WIDTH / 2 + constants.SPLASH_TITLE_SHADOW_OFFSET, 
            constants.SPLASH_TITLE_SHADOW_Y);
        
        // Draw title main color with pixel effect
        this.ctx.fillStyle = '#FFA500';
        this.ctx.fillText('CARROT JUMP', constants.CANVAS_WIDTH / 2, constants.SPLASH_TITLE_Y);

        // Add pixel grid effect to title
        this.ctx.strokeStyle = 'rgba(255, 165, 0, 0.3)';
        this.ctx.lineWidth = 1;
        for (let y = constants.SPLASH_PIXEL_GRID_START_Y; y < constants.SPLASH_PIXEL_GRID_END_Y; y += constants.SPLASH_PIXEL_GRID_SIZE) {
            for (let x = constants.SPLASH_PIXEL_GRID_START_X; x < constants.SPLASH_PIXEL_GRID_END_X; x += constants.SPLASH_PIXEL_GRID_SIZE) {
                this.ctx.strokeRect(x, y, constants.SPLASH_PIXEL_GRID_SIZE, constants.SPLASH_PIXEL_GRID_SIZE);
            }
        }

        // Draw retro box
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(constants.SPLASH_BOX_X, constants.SPLASH_BOX_Y, 
            constants.SPLASH_BOX_WIDTH, constants.SPLASH_BOX_HEIGHT);
        
        // Draw box border
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = constants.SPLASH_BOX_BORDER_WIDTH;
        this.ctx.strokeRect(constants.SPLASH_BOX_X, constants.SPLASH_BOX_Y, 
            constants.SPLASH_BOX_WIDTH, constants.SPLASH_BOX_HEIGHT);
        
        // Draw box inner border
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = constants.SPLASH_BOX_INNER_BORDER_WIDTH;
        this.ctx.strokeRect(
            constants.SPLASH_BOX_X + constants.SPLASH_BOX_INNER_OFFSET,
            constants.SPLASH_BOX_Y + constants.SPLASH_BOX_INNER_OFFSET,
            constants.SPLASH_BOX_WIDTH - constants.SPLASH_BOX_INNER_OFFSET * 2,
            constants.SPLASH_BOX_HEIGHT - constants.SPLASH_BOX_INNER_OFFSET * 2
        );

        // Draw rules text
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = `${constants.SPLASH_RULES_FONT_SIZE}px "Press Start 2P", monospace`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🎯 Collect the carrots to win', 400, constants.SPLASH_RULES_START_Y);
        this.ctx.fillText('⚠️ Avoid the spikes', 400, constants.SPLASH_RULES_START_Y + constants.SPLASH_RULES_LINE_HEIGHT);
        this.ctx.fillText('❤️ You get three lives', 400, constants.SPLASH_RULES_START_Y + constants.SPLASH_RULES_LINE_HEIGHT * 2);
        this.ctx.fillText('⚡ The game gets faster!', 400, constants.SPLASH_RULES_START_Y + constants.SPLASH_RULES_LINE_HEIGHT * 3);

        // Draw start text with blinking effect
        this.ctx.font = `${constants.SPLASH_START_FONT_SIZE}px "Press Start 2P"`;
        this.ctx.textAlign = 'center';
        const opacity = 0.5 + Math.sin(Date.now() / constants.SPLASH_BLINK_SPEED) * 0.5;
        this.ctx.globalAlpha = opacity;
        
        // Draw text shadow
        this.ctx.fillStyle = '#000000';
        this.ctx.fillText('Press SPACE to Start', constants.CANVAS_WIDTH / 2 + constants.SPLASH_START_SHADOW_OFFSET, 
            constants.SPLASH_START_Y);
        
        // Draw main text
        this.ctx.fillStyle = '#FFA500';
        this.ctx.fillText('Press SPACE to Start', constants.CANVAS_WIDTH / 2, 
            constants.SPLASH_START_Y - constants.SPLASH_START_SHADOW_OFFSET);
        
        this.ctx.globalAlpha = 1;

        // Draw corner decorations
        this.ctx.strokeStyle = '#FFA500';
        this.ctx.lineWidth = 2;
        
        // Top left corner
        this.ctx.beginPath();
        this.ctx.moveTo(constants.SPLASH_BOX_X, constants.SPLASH_BOX_Y);
        this.ctx.lineTo(constants.SPLASH_BOX_X + constants.SPLASH_CORNER_LENGTH, constants.SPLASH_BOX_Y);
        this.ctx.moveTo(constants.SPLASH_BOX_X, constants.SPLASH_BOX_Y);
        this.ctx.lineTo(constants.SPLASH_BOX_X, constants.SPLASH_BOX_Y + constants.SPLASH_CORNER_OFFSET);
        this.ctx.stroke();
        
        // Top right corner
        this.ctx.beginPath();
        this.ctx.moveTo(constants.SPLASH_BOX_X + constants.SPLASH_BOX_WIDTH, constants.SPLASH_BOX_Y);
        this.ctx.lineTo(constants.SPLASH_BOX_X + constants.SPLASH_BOX_WIDTH + constants.SPLASH_CORNER_LENGTH, constants.SPLASH_BOX_Y);
        this.ctx.moveTo(constants.SPLASH_BOX_X + constants.SPLASH_BOX_WIDTH, constants.SPLASH_BOX_Y);
        this.ctx.lineTo(constants.SPLASH_BOX_X + constants.SPLASH_BOX_WIDTH, constants.SPLASH_BOX_Y + constants.SPLASH_CORNER_OFFSET);
        this.ctx.stroke();
        
        // Bottom left corner
        this.ctx.beginPath();
        this.ctx.moveTo(constants.SPLASH_BOX_X, constants.SPLASH_BOX_Y + constants.SPLASH_BOX_HEIGHT);
        this.ctx.lineTo(constants.SPLASH_BOX_X + constants.SPLASH_CORNER_LENGTH, constants.SPLASH_BOX_Y + constants.SPLASH_BOX_HEIGHT);
        this.ctx.moveTo(constants.SPLASH_BOX_X, constants.SPLASH_BOX_Y + constants.SPLASH_BOX_HEIGHT);
        this.ctx.lineTo(constants.SPLASH_BOX_X, constants.SPLASH_BOX_Y + constants.SPLASH_BOX_HEIGHT - constants.SPLASH_CORNER_OFFSET);
        this.ctx.stroke();
        
        // Bottom right corner
        this.ctx.beginPath();
        this.ctx.moveTo(constants.SPLASH_BOX_X + constants.SPLASH_BOX_WIDTH, constants.SPLASH_BOX_Y + constants.SPLASH_BOX_HEIGHT);
        this.ctx.lineTo(constants.SPLASH_BOX_X + constants.SPLASH_BOX_WIDTH + constants.SPLASH_CORNER_LENGTH, constants.SPLASH_BOX_Y + constants.SPLASH_BOX_HEIGHT);
        this.ctx.moveTo(constants.SPLASH_BOX_X + constants.SPLASH_BOX_WIDTH, constants.SPLASH_BOX_Y + constants.SPLASH_BOX_HEIGHT);
        this.ctx.lineTo(constants.SPLASH_BOX_X + constants.SPLASH_BOX_WIDTH, constants.SPLASH_BOX_Y + constants.SPLASH_BOX_HEIGHT - constants.SPLASH_CORNER_OFFSET);
        this.ctx.stroke();
    }

    public applyScreenShake(intensity: number): void {
        if (intensity > 0) {
            const shakeAmount = (intensity / constants.SHAKE_DURATION) * constants.SHAKE_INTENSITY;
            this.canvas.style.setProperty('--shake-x', `${shakeAmount}px`);
            this.canvas.style.setProperty('--shake-y', `${shakeAmount}px`);
            this.canvas.classList.add('shaking');
        } else {
            this.canvas.style.removeProperty('--shake-x');
            this.canvas.style.removeProperty('--shake-y');
            this.canvas.classList.remove('shaking');
        }
    }
} 