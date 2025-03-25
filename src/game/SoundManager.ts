import { generateJumpSound, generateHitSound, generateDeathSound, generateCarrotSound, generateGameOverSound } from './soundGenerator';

export class SoundManager {
    private audioContext: AudioContext | null = null;
    private sounds: { [key: string]: AudioBuffer | null } = {
        jump: null,
        hit: null,
        death: null,
        carrot: null,
        gameOver: null
    };
    private isInitialized: boolean = false;

    constructor() {
        // Initialize on first user interaction
        document.addEventListener('keydown', () => this.initAudioContext(), { once: true });
        document.addEventListener('click', () => this.initAudioContext(), { once: true });
    }

    private async initAudioContext(): Promise<void> {
        if (this.isInitialized && this.audioContext?.state !== 'closed') return;

        try {
            // If we have an existing context, close it first
            if (this.audioContext) {
                this.audioContext.close();
            }

            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            await this.audioContext.resume(); // Ensure context is running
            this.loadSounds();
            this.isInitialized = true;
        } catch (error) {
            console.warn('Web Audio API is not supported in this browser');
        }
    }

    private loadSounds(): void {
        if (!this.audioContext || this.audioContext.state === 'closed') return;

        try {
            this.sounds.jump = generateJumpSound(this.audioContext);
            this.sounds.hit = generateHitSound(this.audioContext);
            this.sounds.death = generateDeathSound(this.audioContext);
            this.sounds.carrot = generateCarrotSound(this.audioContext);
            this.sounds.gameOver = generateGameOverSound(this.audioContext);
        } catch (error) {
            console.warn('Failed to generate sounds:', error);
        }
    }

    public async playSound(soundName: 'jump' | 'hit' | 'death' | 'carrot' | 'gameOver'): Promise<void> {
        // Ensure audio context is initialized and not closed
        if (!this.isInitialized || !this.audioContext || this.audioContext.state === 'closed') {
            await this.initAudioContext();
        }

        if (!this.audioContext || !this.sounds[soundName]) {
            console.warn(`Sound ${soundName} not loaded or audio context not initialized`);
            return;
        }

        try {
            // Ensure context is running
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            const source = this.audioContext.createBufferSource();
            source.buffer = this.sounds[soundName]!;
            source.connect(this.audioContext.destination);
            source.start(0);
        } catch (error) {
            console.warn(`Failed to play sound ${soundName}:`, error);
        }
    }

    public async reset(): Promise<void> {
        // Instead of closing the context, just reinitialize it
        await this.initAudioContext();
    }
} 