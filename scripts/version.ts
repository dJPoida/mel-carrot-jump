import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

function incrementVersion(type: 'major' | 'minor' | 'build' = 'build') {
    const packageJsonPath = resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    
    const [major, minor, build] = packageJson.version.split('.').map(Number);
    
    switch (type) {
        case 'major':
            packageJson.version = `${major + 1}.0.0`;
            break;
        case 'minor':
            packageJson.version = `${major}.${minor + 1}.0`;
            break;
        case 'build':
            packageJson.version = `${major}.${minor}.${build + 1}`;
            break;
    }
    
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Version incremented to ${packageJson.version}`);
}

// Get the version type from command line arguments
const type = process.argv[2] as 'major' | 'minor' | 'build' | undefined;
incrementVersion(type); 