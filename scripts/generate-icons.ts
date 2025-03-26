import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const sizes = [192, 512];
const outputDir = path.join(process.cwd(), 'public', 'icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, size, size);

    // Draw carrot
    ctx.fillStyle = '#FF5722';
    ctx.beginPath();
    ctx.moveTo(size * 0.5, size * 0.2);
    ctx.lineTo(size * 0.8, size * 0.5);
    ctx.lineTo(size * 0.5, size * 0.8);
    ctx.closePath();
    ctx.fill();

    // Draw leaves
    ctx.fillStyle = '#4CAF50';
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.2, size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Save the icon
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(outputDir, `icon-${size}x${size}.png`), buffer);
});

console.log('Icons generated successfully!'); 