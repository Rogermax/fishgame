import { Application, Graphics, Texture, WRAP_MODES } from 'pixi.js';

export class TextureGenerator {
    static createRockTexture(app: Application): Texture {
        const size = 128;
        const rockGfx = new Graphics();
        rockGfx.rect(0, 0, size, size);
        rockGfx.fill(0x3d3d3d); // Base dark grey
        
        // Layer 1: Large darker patches
        for(let i=0; i<5; i++) {
            rockGfx.circle(Math.random() * size, Math.random() * size, Math.random() * 20 + 10);
            rockGfx.fill(0x2a2a2a);
        }
        
        // Layer 2: Small noise/highlights
        for(let i=0; i<20; i++) {
            rockGfx.circle(Math.random() * size, Math.random() * size, Math.random() * 4 + 1);
            rockGfx.fill(0x555555);
        }

        const texture = app.renderer.generateTexture(rockGfx);
        texture.source.style.wrapMode = WRAP_MODES.REPEAT;
        return texture;
    }

    static createBubbleTexture(app: Application): Texture {
        const size = 512; // Larger texture for less repetition
        const bubbleGfx = new Graphics();
        bubbleGfx.rect(0, 0, size, size);
        bubbleGfx.fill({ color: 0x000000, alpha: 0 });
        
        // Draw bubbles with padding to avoid edge artifacts
        const padding = 20;
        for(let i=0; i<30; i++) {
            const r = Math.random() * 10 + 5;
            const x = padding + Math.random() * (size - 2 * padding);
            const y = padding + Math.random() * (size - 2 * padding);
            
            bubbleGfx.circle(x, y, r);
            bubbleGfx.fill({ color: 0xffffff, alpha: 0.1 + Math.random() * 0.1 });
            
            // Shine
            bubbleGfx.circle(x - r*0.3, y - r*0.3, r*0.2);
            bubbleGfx.fill({ color: 0xffffff, alpha: 0.3 });
        }
        
        const texture = app.renderer.generateTexture(bubbleGfx);
        texture.source.style.wrapMode = WRAP_MODES.REPEAT;
        return texture;
    }

    static createFishTexture(_app: Application, _width: number, _color: number): Texture {
        // Simple procedural fish texture based on width/color
        // Note: For performance, we might want to cache these or just use Graphics directly.
        // But for now, let's stick to using Graphics per fish instance as they are simple shapes.
        // This method might be unused if we stick to Graphics.
        return Texture.WHITE; 
    }
}
