// Canvas and Display
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 400;
export const GROUND_HEIGHT = 50;
export const FPS = 60;
export const FRAME_TIME = 1000 / FPS;

// Player
export const BUNNY_WIDTH = 32;
export const BUNNY_HEIGHT = 32;
export const DEFAULT_BUNNY_X = 100;
export const JUMP_FORCE = -10;
export const GRAVITY = 0.4;
export const RETURN_TO_CENTER_SPEED = 0.5;
export const INVULNERABILITY_DURATION = 2000;

// Game Objects
export const OBSTACLE_WIDTH = 32;
export const OBSTACLE_HEIGHT = 32;
export const CARROT_WIDTH = 24;
export const CARROT_HEIGHT = 24;
export const PLATFORM_HEIGHT = 16;
export const PLATFORM_WIDTH = 128;
export const PLATFORM_MIN_WIDTH = PLATFORM_WIDTH * 0.75;
export const PLATFORM_MAX_WIDTH = PLATFORM_WIDTH * 1.25;

// Spawning
export const INITIAL_OBSTACLE_SPAWN_RATE = 0.005;
export const INITIAL_CARROT_SPAWN_RATE = 0.015;
export const INITIAL_PLATFORM_SPAWN_RATE = 0.005;
export const PLATFORM_SPAWN_RATE = 0.005;
export const PLATFORM_SPACING = 50;
export const PLATFORM_MIN_GAP = 0.25;
export const OBSTACLE_SPAWN_RATE_INCREASE = 0.001;
export const CARROT_MIN_HEIGHT = 64;
export const CARROT_MAX_HEIGHT = 160;
export const PLATFORM_MIN_HEIGHT = 100;
export const PLATFORM_MAX_HEIGHT = 200;
export const MAX_SPAWN_ATTEMPTS = 10;

// Game Progression
export const INITIAL_SCROLL_SPEED = 2;
export const SPEED_INCREASE_PER_CARROT = 0.25;
export const SCORE_PER_CARROT = 100;
export const SPEED_INCREASE_SCORE_THRESHOLD = 200;

// Visual Effects
export const PARTICLE_COUNT = 10;
export const SHAKE_DURATION = 500;
export const SHAKE_INTENSITY = 4;

// Game State
export const INITIAL_LIVES = 5;
export const SPLASH_DURATION = 2000;

// Death Animation
export const DEATH_ROTATION_SPEED = 4;
export const DEATH_FINAL_ROTATION = Math.PI / 2;

// Renderer constants
export const FLASH_SPEED = 100;
export const FLASH_OPACITY = {
    VISIBLE: 1,
    FADED: 0.3
};

// Splash screen constants
export const SPLASH_TITLE_FONT_SIZE = 64;
export const SPLASH_TITLE_SHADOW_OFFSET = 4;
export const SPLASH_TITLE_Y = 100;
export const SPLASH_TITLE_SHADOW_Y = 104;
export const SPLASH_PIXEL_GRID_START_Y = 80;
export const SPLASH_PIXEL_GRID_END_Y = 120;
export const SPLASH_PIXEL_GRID_START_X = 250;
export const SPLASH_PIXEL_GRID_END_X = 550;
export const SPLASH_PIXEL_GRID_SIZE = 4;
export const SPLASH_BOX_X = 150;
export const SPLASH_BOX_Y = 120;
export const SPLASH_BOX_WIDTH = 500;
export const SPLASH_BOX_HEIGHT = 160;
export const SPLASH_BOX_BORDER_WIDTH = 4;
export const SPLASH_BOX_INNER_BORDER_WIDTH = 2;
export const SPLASH_BOX_INNER_OFFSET = 4;
export const SPLASH_RULES_FONT_SIZE = 16;
export const SPLASH_RULES_START_Y = 160;
export const SPLASH_RULES_LINE_HEIGHT = 30;
export const SPLASH_START_FONT_SIZE = 24;
export const SPLASH_START_Y = 320;
export const SPLASH_START_SHADOW_OFFSET = 1;
export const SPLASH_CORNER_LENGTH = 10;
export const SPLASH_CORNER_OFFSET = 10;
export const SPLASH_BLINK_SPEED = 500;

export const SPLASH_VERSION_FONT_SIZE = 12;
export const SPLASH_VERSION_Y = 350;
export const SPLASH_VERSION_SHADOW_OFFSET = 1; 