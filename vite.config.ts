import { defineConfig } from 'vite';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';

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