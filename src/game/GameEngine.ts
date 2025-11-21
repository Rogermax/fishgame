import { Application, Container, Graphics, Text, TilingSprite } from 'pixi.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, WORLD_HEIGHT, PIXELS_PER_METER, HOOK_SIZE, BASE_HOOK_SPEED, HOOK_LATERAL_SPEED, WALL_THICKNESS, CANYON_WIDTH_START, CANYON_WIDTH_END, PLAYABLE_WIDTH_START, PLAYABLE_WIDTH_END, MAX_DEPTH_METERS } from '../constants';
import type { GameState, InputState } from '../types';
import { FISH_LIBRARY } from '../data/fishData';
import { TextureGenerator } from '../utils/TextureGenerator';

export class GameEngine {
    app: Application;
    state: GameState;
    input: InputState;
    
    // Containers
    worldContainer: Container;
    bgContainer: Container;
    uiContainer: Container;
    debugContainer: Container;

    // Sprites/Graphics
    hookGraphics: Graphics;
    lineGraphics: Graphics;
    bubbles: TilingSprite;
    leftWall: TilingSprite;
    rightWall: TilingSprite;
    scoreText: Text;
    depthText: Text;
    debugText: Text;

    constructor(app: Application, state: GameState, input: InputState) {
        this.app = app;
        this.state = state;
        this.input = input;

        this.worldContainer = new Container();
        this.bgContainer = new Container();
        this.uiContainer = new Container();
        this.debugContainer = new Container();
        
        this.hookGraphics = new Graphics();
        this.lineGraphics = new Graphics();
        
        // Initialize placeholders
        const bubbleTex = TextureGenerator.createBubbleTexture(app);
        this.bubbles = new TilingSprite({ texture: bubbleTex });
        
        const rockTex = TextureGenerator.createRockTexture(app);
        this.leftWall = new TilingSprite({ texture: rockTex });
        this.rightWall = new TilingSprite({ texture: rockTex });

        this.scoreText = new Text({ text: '' });
        this.depthText = new Text({ text: '' });
        this.debugText = new Text({ text: '' });
    }

    async setup() {
        // Layers
        this.app.stage.addChild(this.bgContainer);
        this.app.stage.addChild(this.worldContainer);
        this.app.stage.addChild(this.uiContainer);

        // Background - Gradient
        const water = new Graphics();
        water.rect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        water.fill(0x001f3f);
        this.bgContainer.addChild(water);

        // Bubbles
        const bubbleTex = TextureGenerator.createBubbleTexture(this.app);
        this.bubbles = new TilingSprite({ texture: bubbleTex, width: CANVAS_WIDTH, height: CANVAS_HEIGHT });
        this.bgContainer.addChild(this.bubbles);

        // Walls (Screen Space)
        const rockTex = TextureGenerator.createRockTexture(this.app);
        this.leftWall = new TilingSprite({ texture: rockTex, width: WALL_THICKNESS, height: CANVAS_HEIGHT });
        this.leftWall.x = 0;
        this.bgContainer.addChild(this.leftWall);

        this.rightWall = new TilingSprite({ texture: rockTex, width: WALL_THICKNESS, height: CANVAS_HEIGHT });
        this.rightWall.x = CANVAS_WIDTH - WALL_THICKNESS;
        this.bgContainer.addChild(this.rightWall);

        // Hook
        this.hookGraphics.rect(0, 0, HOOK_SIZE, HOOK_SIZE);
        this.hookGraphics.fill(0xC0C0C0);
        this.worldContainer.addChild(this.hookGraphics);
        this.worldContainer.addChild(this.lineGraphics);

        // UI
        this.scoreText = new Text({ text: 'Score: 0', style: { fontFamily: 'Arial', fontSize: 24, fill: 0xffffff, fontWeight: 'bold', dropShadow: { distance: 2, blur: 2, color: 'black', alpha: 0.5 } } });
        this.scoreText.position.set(20, 40);
        this.uiContainer.addChild(this.scoreText);

        this.depthText = new Text({ text: 'Depth: 0.0m', style: { fontFamily: 'Arial', fontSize: 20, fill: 0xadd8e6, fontWeight: 'bold', dropShadow: { distance: 2, blur: 2, color: 'black', alpha: 0.5 } } });
        this.depthText.position.set(20, 70);
        this.uiContainer.addChild(this.depthText);

        this.debugText = new Text({ text: "Tap to fish | 'D' for debug", style: { fontFamily: 'Arial', fontSize: 14, fill: 0xffffff } });
        this.debugText.alpha = 0.5;
        this.debugText.position.set(20, CANVAS_HEIGHT - 30);
        this.uiContainer.addChild(this.debugText);

        this.debugContainer.visible = false;
        this.worldContainer.addChild(this.debugContainer);

        this.spawnFish();
    }

    spawnFish() {
        // Clear existing
        this.state.fishes.forEach(f => {
            this.worldContainer.removeChild(f.sprite);
            f.sprite.destroy();
        });
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
            
            // Create Graphics fish (simple triangle)
            const width = species.sizeCm * (PIXELS_PER_METER / 100); // 1cm = 2px at 200px/m
            const height = width / 2;
            
            const fishGfx = new Graphics();
            fishGfx.moveTo(0, 0); // Nose
            fishGfx.lineTo(-width, -height/2);
            fishGfx.lineTo(-width, height/2);
            fishGfx.fill(species.color);

            const minX = WALL_THICKNESS + width;
            const maxX = CANVAS_WIDTH - WALL_THICKNESS - width;
            const side = Math.random() < 0.5 ? 'left' : 'right';

            fishGfx.x = minX + Math.random() * (maxX - minX);
            fishGfx.y = y;
            
            if (side === 'right') fishGfx.scale.x = -1;

            this.worldContainer.addChild(fishGfx);

            this.state.fishes.push({
                id: Date.now() + Math.random() + i,
                sprite: fishGfx,
                x: fishGfx.x,
                y: fishGfx.y,
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
        const hook = this.state.hook;

        // Input
        if (this.input.left) hook.x -= HOOK_LATERAL_SPEED * delta;
        if (this.input.right) hook.x += HOOK_LATERAL_SPEED * delta;
        hook.x = Math.max(WALL_THICKNESS, Math.min(CANVAS_WIDTH - WALL_THICKNESS - HOOK_SIZE, hook.x));

        // Hook State
        if (hook.state === 'dropping') {
            let currentSpeed = BASE_HOOK_SPEED;
            // Slow down near bottom?
            // For now linear speed
            hook.y += currentSpeed * delta;

            if (hook.y >= WORLD_HEIGHT) {
                hook.state = 'bottom_pause';
                this.state.bottomTimer = Date.now();
            }

            // Collision
            for (let i = 0; i < this.state.fishes.length; i++) {
                const fish = this.state.fishes[i];
                // AABB
                let fishBounds = { x: fish.x - fish.width, y: fish.y - fish.height/2, w: fish.width, h: fish.height };
                if (fish.direction === -1) fishBounds.x = fish.x;

                if (
                    hook.x < fishBounds.x + fishBounds.w &&
                    hook.x + HOOK_SIZE > fishBounds.x &&
                    hook.y < fishBounds.y + fishBounds.h &&
                    hook.y + HOOK_SIZE > fishBounds.y
                ) {
                    hook.state = 'reeling';
                    hook.caughtFish = fish;
                    this.state.fishes.splice(i, 1);
                    break;
                }
            }

        } else if (hook.state === 'bottom_pause') {
            if (Date.now() - this.state.bottomTimer > 500) {
                hook.state = 'reeling';
            }
        } else if (hook.state === 'reeling') {
            hook.y -= BASE_HOOK_SPEED * 2 * delta; // Faster reel
            if (hook.y <= 200) {
                hook.state = 'idle';
                hook.y = 200;
                if (hook.caughtFish) {
                    this.state.score += hook.caughtFish.species.points;
                    this.scoreText.text = `Score: ${this.state.score}`;
                    this.worldContainer.removeChild(hook.caughtFish.sprite);
                    hook.caughtFish.sprite.destroy();
                    hook.caughtFish = null;
                }
            }
        }

        // Fish Movement
        this.state.fishes.forEach(fish => {
            fish.x += fish.speed * fish.direction * delta;
            if (fish.direction === 1 && fish.x > CANVAS_WIDTH + fish.width) {
                fish.direction = -1;
                fish.x = CANVAS_WIDTH + fish.width;
                fish.sprite.scale.x = -1;
            } else if (fish.direction === -1 && fish.x < -fish.width * 2) {
                fish.direction = 1;
                fish.x = -fish.width * 2;
                fish.sprite.scale.x = 1;
            }
            fish.sprite.x = fish.x;
            fish.sprite.y = fish.y;
        });

        // Camera
        let targetCameraY = hook.y - CANVAS_HEIGHT / 3;
        targetCameraY = Math.max(0, Math.min(targetCameraY, WORLD_HEIGHT - CANVAS_HEIGHT));
        this.state.cameraY = targetCameraY;
        this.worldContainer.y = -this.state.cameraY;
        
        // Dynamic Zoom based on depth (perspective effect)
        const depthMeters = Math.max(0, (hook.y - 200) / PIXELS_PER_METER);
        const zoomProgress = Math.min(depthMeters / MAX_DEPTH_METERS, 1); // 0 to 1
        const zoomFactor = 1 + zoomProgress * 4; // Zoom out from 1x to 5x
        this.worldContainer.scale.set(1 / zoomFactor);
        
        // Adjust worldContainer position to keep it centered with zoom
        this.worldContainer.x = CANVAS_WIDTH / 2;
        this.worldContainer.pivot.set(CANVAS_WIDTH / 2, this.state.cameraY + CANVAS_HEIGHT / 3);
        
        // Expanding canyon walls
        const currentCanyonWidth = PLAYABLE_WIDTH_START + (PLAYABLE_WIDTH_END - PLAYABLE_WIDTH_START) * zoomProgress;
        const wallOffset = (CANVAS_WIDTH - currentCanyonWidth * (1 / zoomFactor)) / 2;
        this.leftWall.x = wallOffset;
        this.rightWall.x = CANVAS_WIDTH - wallOffset - WALL_THICKNESS;
        
        // Parallax & Walls scrolling
        this.bubbles.tilePosition.y = -this.state.cameraY * 0.2;
        this.leftWall.tilePosition.y = -this.state.cameraY;
        this.rightWall.tilePosition.y = -this.state.cameraY;

        // Update Visuals
        this.hookGraphics.x = hook.x;
        this.hookGraphics.y = hook.y;

        this.lineGraphics.clear();
        this.lineGraphics.moveTo(CANVAS_WIDTH / 2, -1000);
        this.lineGraphics.lineTo(hook.x + HOOK_SIZE/2, -1000);
        this.lineGraphics.lineTo(hook.x + HOOK_SIZE/2, hook.y);
        this.lineGraphics.stroke({ width: 2, color: 0xffffff });

        if (hook.caughtFish) {
            hook.caughtFish.sprite.x = hook.x + HOOK_SIZE/2;
            hook.caughtFish.sprite.y = hook.y + HOOK_SIZE + hook.caughtFish.height/2;
            hook.caughtFish.sprite.rotation = Math.PI / 2;
        }

        // UI
        const currentDepth = Math.max(0, (hook.y - 200) / PIXELS_PER_METER);
        this.state.depth = currentDepth;
        this.depthText.text = `Depth: ${currentDepth.toFixed(1)}m`;

        // Debug
        this.debugContainer.visible = this.state.debug;
        if (this.state.debug) {
            this.debugContainer.removeChildren();
            const gfx = new Graphics();
            for (let m = 0; m <= WORLD_HEIGHT / PIXELS_PER_METER; m += 10) {
                const y = 200 + m * PIXELS_PER_METER;
                if (y < this.state.cameraY - 50 || y > this.state.cameraY + CANVAS_HEIGHT + 50) continue;
                const isMajor = m % 50 === 0;
                gfx.moveTo(0, y);
                gfx.lineTo(CANVAS_WIDTH, y);
                gfx.stroke({ width: isMajor ? 4 : 2, color: isMajor ? 0xFFFF00 : 0xFFFFFF, alpha: 0.5 });
            }
            this.debugContainer.addChild(gfx);
        }
    }
}
