export const CANVAS_WIDTH = 720;
export const CANVAS_HEIGHT = 1280;

// Scale
export const PIXELS_PER_METER = 200; // 1 meter = 200 pixels (1cm = 2px)
export const MAX_DEPTH_METERS = 11000;
export const WORLD_HEIGHT = MAX_DEPTH_METERS * PIXELS_PER_METER;

// Canyon/Tunnel dimensions
export const CANYON_WIDTH_START = 10; // meters at surface
export const CANYON_WIDTH_END = 50; // meters at max depth
export const PLAYABLE_WIDTH_START = CANYON_WIDTH_START * PIXELS_PER_METER; // pixels
export const PLAYABLE_WIDTH_END = CANYON_WIDTH_END * PIXELS_PER_METER; // pixels

// Hook
export const HOOK_SIZE = 30;
export const BASE_HOOK_SPEED = 7.8125 * 3; // Increased to compensate for zoom
export const HOOK_LATERAL_SPEED = 12;

// Walls
export const WALL_THICKNESS = 40;
