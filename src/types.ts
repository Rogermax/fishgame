import { Graphics } from 'pixi.js';

export interface FishSpecies {
    name: string;
    sizeCm: number; // Length in cm
    depthMin: number; // Meters
    depthMax: number; // Meters
    points: number;
    rarity: 'common' | 'magic' | 'rare' | 'legendary';
    color: number;
}

export interface FishData {
    id: number;
    sprite: Graphics;
    x: number;
    y: number;
    width: number;
    height: number;
    speed: number;
    direction: 1 | -1;
    species: FishSpecies;
}

export interface GameState {
    hook: {
        x: number;
        y: number;
        state: 'idle' | 'dropping' | 'ascending' | 'reeling' | 'bottom_pause';
        caughtFishes: FishData[];
    };
    fishes: FishData[];
    score: number;
    depth: number;
    cameraY: number;
    bottomTimer: number;
    debug: boolean;
}

export interface InputState {
    left: boolean;
    right: boolean;
}
