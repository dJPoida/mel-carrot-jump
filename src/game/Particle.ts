import { Particle as IParticle } from '../types/game';

export class Particle implements IParticle {
    constructor(
        public x: number,
        public y: number,
        public width: number = Math.random() * 4 + 2,
        public height: number = Math.random() * 4 + 2,
        public speedX: number = (Math.random() - 0.5) * 8,
        public speedY: number = (Math.random() - 0.5) * 8,
        public life: number = 1.0,
        public color: string = '#FF0000'
    ) {}

    update(): void {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.02; // Fade out
        this.speedY += 0.2; // Gravity effect
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
} 