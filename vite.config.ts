import { defineConfig } from 'vite';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

// Generate a unique version for development
const generateDevVersion = () => {
    const timestamp = Date.now();
    return `dev-${timestamp}`;
};

// Run version increment script before build
if (process.env.NODE_ENV === 'production') {
    try {
        execSync('tsx scripts/version.ts', { stdio: 'inherit' });
        
        // Generate version file
        const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
        const versionContent = `// This file is auto-generated during build
export const VERSION = '${packageJson.version}';
`;
        writeFileSync('src/version.ts', versionContent);

        // Update service worker with version
        let swContent = readFileSync('public/sw.js', 'utf-8');
        swContent = swContent.replace(/const VERSION = '.*?';/, `const VERSION = '${packageJson.version}';`);
        writeFileSync('public/sw.js', swContent);

        // Update index.html with version
        let indexContent = readFileSync('index.html', 'utf-8');
        indexContent = indexContent.replace(/let currentVersion = '.*?';/, `let currentVersion = '${packageJson.version}';`);
        writeFileSync('index.html', indexContent);
    } catch (error) {
        console.error('Failed to increment version:', error);
    }
} else {
    // Generate development version
    const devVersion = generateDevVersion();
    const versionContent = `// This file is auto-generated during development
export const VERSION = '${devVersion}';
`;
    writeFileSync('src/version.ts', versionContent);

    // Update service worker with dev version
    let swContent = readFileSync('public/sw.js', 'utf-8');
    swContent = swContent.replace(/const VERSION = '.*?';/, `const VERSION = '${devVersion}';`);
    writeFileSync('public/sw.js', swContent);

    // Update index.html with dev version
    let indexContent = readFileSync('index.html', 'utf-8');
    indexContent = indexContent.replace(/let currentVersion = '.*?';/, `let currentVersion = '${devVersion}';`);
    writeFileSync('index.html', indexContent);
}

export default defineConfig({
  build: {
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
}); 