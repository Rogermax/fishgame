import { Application, Container, Graphics, Text, TilingSprite } from 'pixi.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, WORLD_HEIGHT, PIXELS_PER_METER, HOOK_SIZE, WALL_THICKNESS, PLAYABLE_WIDTH_START, PLAYABLE_WIDTH_END, MAX_DEPTH_METERS } from '../../constants';
import type { GameState } from '../../types';
import { TextureGenerator } from '../../utils/TextureGenerator';


export class RenderSystem {
    app: Application;
    state: GameState;
    
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

    constructor(app: Application, state: GameState) {
        this.app = app;
        this.state = state;

        this.worldContainer = new Container();
        this.bgContainer = new Container();
        this.uiContainer = new Container();
        this.debugContainer = new Container();
        
        this.hookGraphics = new Graphics();
        this.lineGraphics = new Graphics();
        
        // Initialize placeholders (textures created in setup)
        this.bubbles = new TilingSprite({ texture: TextureGenerator.createBubbleTexture(app) });
        const rockTex = TextureGenerator.createRockTexture(app);
        this.leftWall = new TilingSprite({ texture: rockTex });
        this.rightWall = new TilingSprite({ texture: rockTex });

        this.scoreText = new Text({ text: '' });
        this.depthText = new Text({ text: '' });
        this.debugText = new Text({ text: '' });
    }

    setup() {
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
        
        // Initial Fish Spawn Visuals
        this.syncFishSprites();
    }

    update() {
        const hook = this.state.hook;

        // Camera
        let targetCameraY = hook.y - CANVAS_HEIGHT / 3;
        targetCameraY = Math.max(0, Math.min(targetCameraY, WORLD_HEIGHT - CANVAS_HEIGHT));
        this.state.cameraY = targetCameraY;
        
        // Fix: Position world at the screen's "focus point" (1/3 down), and pivot around the corresponding world point.
        this.worldContainer.position.set(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 3);
        this.worldContainer.pivot.set(CANVAS_WIDTH / 2, this.state.cameraY + CANVAS_HEIGHT / 3);
        
        // Dynamic Zoom
        const depthMeters = Math.max(0, (hook.y - 200) / PIXELS_PER_METER);
        const zoomProgress = Math.min(depthMeters / MAX_DEPTH_METERS, 1);
        const zoomFactor = 1 + zoomProgress * 4;
        this.worldContainer.scale.set(1 / zoomFactor);
        
        // Walls & Parallax
        const currentCanyonWidth = PLAYABLE_WIDTH_START + (PLAYABLE_WIDTH_END - PLAYABLE_WIDTH_START) * zoomProgress;
        const wallOffset = (CANVAS_WIDTH - currentCanyonWidth * (1 / zoomFactor)) / 2;
        this.leftWall.x = wallOffset;
        this.rightWall.x = CANVAS_WIDTH - wallOffset - WALL_THICKNESS;
        
        this.bubbles.tilePosition.y = -this.state.cameraY * 0.2;
        this.leftWall.tilePosition.y = -this.state.cameraY;
        this.rightWall.tilePosition.y = -this.state.cameraY;

        // Hook & Line
        this.hookGraphics.x = hook.x;
        this.hookGraphics.y = hook.y;

        this.lineGraphics.clear();
        this.lineGraphics.moveTo(CANVAS_WIDTH / 2, -1000);
        this.lineGraphics.lineTo(hook.x + HOOK_SIZE/2, -1000);
        this.lineGraphics.lineTo(hook.x + HOOK_SIZE/2, hook.y);
        this.lineGraphics.stroke({ width: 2, color: 0xffffff });

        // Fish
        this.syncFishSprites();

        // Caught Fish
        hook.caughtFishes.forEach((fish, index) => {
            if (fish.sprite) {
                // Stack them on the hook
                // Offset slightly so we can see them all
                const offset = index * 10;
                fish.sprite.x = hook.x + HOOK_SIZE/2;
                fish.sprite.y = hook.y + HOOK_SIZE + fish.height/2 + offset;
                fish.sprite.rotation = Math.PI / 2;
                
                // Ensure it's in the world container (might have been removed from fishes array)
                if (fish.sprite.parent !== this.worldContainer) {
                    this.worldContainer.addChild(fish.sprite);
                }
            }
        });

        // UI
        this.scoreText.text = `Score: ${this.state.score}`;
        this.depthText.text = `Depth: ${depthMeters.toFixed(1)}m`;

        // Debug
        this.debugContainer.visible = this.state.debug;
        if (this.state.debug) {
            this.renderDebug();
        }
    }

    private syncFishSprites() {
        // Add new sprites
        this.state.fishes.forEach(fish => {
            if (!fish.sprite || fish.sprite.destroyed) {
                if (!fish.sprite) {
                    this.createFishSprite(fish);
                }
                this.worldContainer.addChild(fish.sprite);
            }
            
            fish.sprite.x = fish.x;
            fish.sprite.y = fish.y;
            
            // Fix Orientation:
            // Direction 1 (Right): Scale 1.
            // Direction -1 (Left): Scale -1.
            fish.sprite.scale.x = fish.direction; 
        });

        // Cleanup sprites that are no longer in state.fishes AND not in caughtFishes
        // This is a bit tricky without a dedicated sprite manager.
        // For now, we rely on the fact that if it's in caughtFishes, we handle it above.
        // If it's in neither, it should be removed.
        // But iterating all children is slow.
        // Let's rely on the fact that we only remove from state.fishes when caught.
        // So if it's caught, we move it.
        // What if it's destroyed? (e.g. reset).
        // GameEngine.spawnFish clears existing.
    }

    createFishSprite(fish: any) {
        const width = fish.width;
        const height = fish.height;
        
        const fishGfx = new Graphics();
        fishGfx.moveTo(0, 0); // Nose
        fishGfx.lineTo(-width, -height/2); // Top Tail
        fishGfx.lineTo(-width, height/2); // Bottom Tail
        fishGfx.fill(fish.species.color);
        
        fish.sprite = fishGfx;
    }

    private renderDebug() {
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
