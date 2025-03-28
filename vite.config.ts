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
    } catch (error) {
        console.error('Failed to increment version:', error);
    }
} else {
    // Generate development version
    const versionContent = `// This file is auto-generated during development
export const VERSION = '${generateDevVersion()}';
`;
    writeFileSync('src/version.ts', versionContent);
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