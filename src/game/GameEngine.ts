import { Application } from 'pixi.js';
import { WORLD_HEIGHT, PIXELS_PER_METER, WALL_THICKNESS, CANVAS_WIDTH } from '../constants';
import type { GameState, InputState } from '../types';
import { FISH_LIBRARY } from '../data/fishData';
import { InputSystem } from './systems/InputSystem';
import { PhysicsSystem } from './systems/PhysicsSystem';
import { RenderSystem } from './systems/RenderSystem';

export class GameEngine {
    app: Application;
    state: GameState;
    input: InputState;

    // Systems
    inputSystem: InputSystem;
    physicsSystem: PhysicsSystem;
    renderSystem: RenderSystem;

    constructor(app: Application, state: GameState, input: InputState) {
        this.app = app;
        this.state = state;
        this.input = input;

        this.inputSystem = new InputSystem(input);
        this.physicsSystem = new PhysicsSystem(state, input);
        this.renderSystem = new RenderSystem(app, state);
    }

    async setup() {
        await this.renderSystem.setup();
        this.spawnFish();
    }

    spawnFish() {
        // Clear existing
        this.state.fishes = [];

        // Generate based on library
        const totalMeters = WORLD_HEIGHT / PIXELS_PER_METER;
        const fishCount = Math.floor(totalMeters / 5); // One fish every 5m roughly

        for (let i = 0; i < fishCount; i++) {
            const depth = Math.random() * totalMeters;
            const y = 200 + depth * PIXELS_PER_METER;

            // Find eligible fish for this depth
            const eligible = FISH_LIBRARY.filter(f => depth >= f.depthMin && depth <= f.depthMax);
            if (eligible.length === 0) continue;

            const species = eligible[Math.floor(Math.random() * eligible.length)];
            
            // Create Fish Data
            const width = species.sizeCm * (PIXELS_PER_METER / 100); // 1cm = 2px at 200px/m
            const height = width / 2;
            
            const minX = WALL_THICKNESS + width;
            const maxX = CANVAS_WIDTH - WALL_THICKNESS - width;
            const side = Math.random() < 0.5 ? 'left' : 'right';

            const x = minX + Math.random() * (maxX - minX);
            
            this.state.fishes.push({
                id: Date.now() + Math.random() + i,
                sprite: null as any, // RenderSystem will handle sprite creation
                x: x,
                y: y,
                width,
                height,
                speed: 2 + Math.random() * 2,
                direction: side === 'left' ? 1 : -1,
                species
            });
        }
        console.log(`Spawned ${this.state.fishes.length} fish.`);
    }

    update(delta: number) {
        this.inputSystem.update();
        this.physicsSystem.update(delta);
        this.renderSystem.update();
    }
}
