import { describe, it, expect, beforeEach } from 'vitest';
import { Particle } from '../Particle';

describe('Particle', () => {
    let particle: Particle;
    let mockCtx: CanvasRenderingContext2D;

    beforeEach(() => {
        particle = new Particle(100, 100);
        mockCtx = {
            fillStyle: '',
            globalAlpha: 1,
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn(),
            restore: vi.fn(),
        } as unknown as CanvasRenderingContext2D;
    });

    it('should initialize with correct properties', () => {
        expect(particle.x).toBe(100);
        expect(particle.y).toBe(100);
        expect(particle.width).toBeGreaterThan(0);
        expect(particle.height).toBeGreaterThan(0);
        expect(particle.speedX).toBeDefined();
        expect(particle.speedY).toBeDefined();
        expect(particle.life).toBe(1.0);
        expect(particle.color).toBe('#FF0000');
    });

    it('should update position and life', () => {
        const initialX = particle.x;
        const initialY = particle.y;
        const initialLife = particle.life;

        particle.update();

        expect(particle.x).not.toBe(initialX);
        expect(particle.y).not.toBe(initialY);
        expect(particle.life).toBeLessThan(initialLife);
        expect(particle.speedY).toBeGreaterThan(0); // Gravity effect
    });

    it('should draw correctly', () => {
        particle.draw(mockCtx);

        expect(mockCtx.fillStyle).toBe(particle.color);
        expect(mockCtx.globalAlpha).toBe(particle.life);
        expect(mockCtx.beginPath).toHaveBeenCalled();
        expect(mockCtx.arc).toHaveBeenCalledWith(
            particle.x,
            particle.y,
            particle.width,
            0,
            Math.PI * 2
        );
        expect(mockCtx.fill).toHaveBeenCalled();
        expect(mockCtx.globalAlpha).toBe(1);
    });
}); 