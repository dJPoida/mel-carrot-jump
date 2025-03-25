export function generateJumpSound(audioContext: AudioContext): AudioBuffer {
    const duration = 0.1;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const frequency = 440 * Math.pow(2, t * 12); // Rising pitch
        channelData[i] = Math.sin(2 * Math.PI * frequency * t) * (1 - t / duration);
    }

    return buffer;
}

export function generateHitSound(audioContext: AudioContext): AudioBuffer {
    const duration = 0.12; // Quick "ow" duration
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        
        // Create a quick attack and release for "ow" sound
        const attack = Math.exp(-t * 30); // Sharp initial hit
        const release = Math.exp(-t * 8); // Slower release
        
        // Create a vocal-like "ow" sound with formants
        const baseFreq = 300; // Base frequency for "ow" sound
        const freq1 = baseFreq * Math.pow(2, -t * 4); // Main falling pitch
        const freq2 = baseFreq * 1.5 * Math.pow(2, -t * 3); // Second formant
        const freq3 = baseFreq * 2 * Math.pow(2, -t * 2); // Third formant
        
        // Add some noise for the impact
        const noise = (Math.random() - 0.5) * 0.2;
        
        // Combine frequencies to create "ow" sound
        channelData[i] = (
            Math.sin(2 * Math.PI * freq1 * t) * 0.4 + // Main frequency
            Math.sin(2 * Math.PI * freq2 * t) * 0.3 + // Second formant
            Math.sin(2 * Math.PI * freq3 * t) * 0.2 + // Third formant
            noise
        ) * attack * release; // Apply both attack and release envelopes
    }

    return buffer;
}

export function generateDeathSound(audioContext: AudioContext): AudioBuffer {
    const duration = 0.2;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const frequency = 110 * Math.pow(2, -t * 3); // Very low falling pitch
        channelData[i] = Math.sin(2 * Math.PI * frequency * t) * (1 - t / duration);
    }

    return buffer;
}

export function generateCarrotSound(audioContext: AudioContext): AudioBuffer {
    const duration = 0.1;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const frequency = 880 * Math.pow(2, t * 6); // High rising pitch
        channelData[i] = Math.sin(2 * Math.PI * frequency * t) * (1 - t / duration);
    }

    return buffer;
}

export function generateGameOverSound(audioContext: AudioContext): AudioBuffer {
    const duration = 0.6; // Shorter total duration (was 1.2)
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Parameters for each "wah"
    const wahDuration = 0.2; // Shorter duration for each wah (was 0.4)
    const baseFreq = 400; // Starting frequency
    const wahFreqs = [baseFreq, baseFreq * 0.7, baseFreq * 0.5]; // Steeper frequency drops

    for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        let sample = 0;

        // Generate three "wah" sounds
        for (let wahIndex = 0; wahIndex < 3; wahIndex++) {
            const wahTime = t - wahIndex * wahDuration;
            if (wahTime >= 0 && wahTime < wahDuration) {
                // Create a "wah" envelope with faster attack
                const envelope = Math.sin(Math.PI * wahTime / wahDuration) * Math.exp(-wahTime * 2);
                
                // Add some vibrato (faster)
                const vibrato = Math.sin(2 * Math.PI * 8 * wahTime) * 0.2;
                
                // Generate the main tone with vibrato
                const freq = wahFreqs[wahIndex] * (1 + vibrato);
                sample += Math.sin(2 * Math.PI * freq * wahTime) * envelope * 0.3;
                
                // Add a second harmonic for richness
                sample += Math.sin(4 * Math.PI * freq * wahTime) * envelope * 0.15;
            }
        }

        channelData[i] = sample;
    }

    return buffer;
} 