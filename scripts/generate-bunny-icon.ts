import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';

const sizes = [16, 32, 192, 512];
const outputDir = path.join(process.cwd(), 'public', 'icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function drawBunny(ctx: any, size: number) {
    // Set background color to match game's background
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, 0, size, size);

    // Scale the bunny size relative to the icon size (game uses 32x32)
    const scale = size / 32;
    const bunnyWidth = 32 * scale;
    const bunnyHeight = 32 * scale;
    const bunnyX = (size - bunnyWidth) / 2;
    const bunnyY = (size - bunnyHeight) / 2;

    // Draw bunny body (white rectangle)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(bunnyX, bunnyY, bunnyWidth, bunnyHeight);

    // Draw bunny ears (white rectangles)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(bunnyX - 4 * scale, bunnyY - 8 * scale, 8 * scale, 16 * scale);
    ctx.fillRect(bunnyX + bunnyWidth - 4 * scale, bunnyY - 8 * scale, 8 * scale, 16 * scale);

    // Draw bunny eyes (black rectangles)
    ctx.fillStyle = '#000000';
    ctx.fillRect(bunnyX + 8 * scale, bunnyY + 8 * scale, 4 * scale, 4 * scale);
    ctx.fillRect(bunnyX + bunnyWidth - 12 * scale, bunnyY + 8 * scale, 4 * scale, 4 * scale);

    // Draw bunny nose (pink rectangle)
    ctx.fillStyle = '#FFB6C1';
    ctx.fillRect(bunnyX + bunnyWidth/2 - 2 * scale, bunnyY + 12 * scale, 4 * scale, 4 * scale);

    // Draw bunny mouth (happy arc)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2 * scale;
    ctx.beginPath();
    const mouthY = bunnyY + 16 * scale;
    const mouthX = bunnyX + bunnyWidth/2;
    ctx.arc(mouthX, mouthY, 4 * scale, 0, Math.PI);
    ctx.stroke();

    // Draw bunny feet (pink semi-ellipses)
    ctx.fillStyle = '#FFE4E1';  // Pastel pink (Misty Rose)
    ctx.strokeStyle = '#FFB6C1';  // Light pink outline
    ctx.lineWidth = 1 * scale;
    
    const feetY = bunnyY + bunnyHeight - 4 * scale;
    
    ctx.beginPath();
    ctx.ellipse(bunnyX + 8 * scale, feetY, 6 * scale, 4 * scale, 0, 0, Math.PI);
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.ellipse(bunnyX + bunnyWidth - 8 * scale, feetY, 6 * scale, 4 * scale, 0, 0, Math.PI);
    ctx.fill();
    ctx.stroke();
}

sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    drawBunny(ctx, size);

    // Save the icon
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(path.join(outputDir, `icon-${size}x${size}.png`), buffer);
});

// Create favicon.ico (16x16)
const faviconCanvas = createCanvas(16, 16);
const faviconCtx = faviconCanvas.getContext('2d');
drawBunny(faviconCtx, 16);

// Save favicon
const faviconBuffer = faviconCanvas.toBuffer('image/png');
fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.ico'), faviconBuffer);

console.log('Icons generated successfully!'); 