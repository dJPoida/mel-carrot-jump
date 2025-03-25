# Bunny Game

A fun bunny jumping game built with TypeScript and HTML5 Canvas. Collect carrots, avoid spikes, and try to get the highest score!

## Features

- Smooth animations and particle effects
- Sound effects for jumping, collecting carrots, and more
- Progressive difficulty as you collect carrots
- High score system with local storage
- Double jump mechanics
- Death animation with screen shake
- Responsive controls

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm start
```

3. Run tests:
```bash
npm test
```

4. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── assets/         # Static assets
├── game/           # Game logic and components
│   ├── __tests__/  # Test files
│   ├── constants.ts
│   ├── Game.ts
│   ├── Particle.ts
│   └── SoundManager.ts
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
├── index.ts        # Main entry point
└── styles.css      # Global styles
```

## Controls

- **Space**: Jump (press twice for double jump)
- **Enter**: Restart game (when game over)
- **Double-click High Score**: Reset high score

## Technologies Used

- TypeScript
- HTML5 Canvas
- Vite
- Vitest
- ESLint
- Prettier

## License

MIT 