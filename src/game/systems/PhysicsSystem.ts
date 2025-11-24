import { CANVAS_WIDTH, WORLD_HEIGHT, HOOK_SIZE, BASE_HOOK_SPEED, HOOK_LATERAL_SPEED, WALL_THICKNESS, MAX_CATCH } from '../../constants';
import type { GameState, InputState } from '../../types';

export class PhysicsSystem {
    private state: GameState;
    private input: InputState;

    constructor(state: GameState, input: InputState) {
        this.state = state;
        this.input = input;
    }

    update(delta: number) {
        this.updateHook(delta);
        this.updateFish(delta);
    }

    private updateHook(delta: number) {
        const hook = this.state.hook;

        // Lateral Movement (Allowed in dropping and ascending)
        if (hook.state === 'dropping' || hook.state === 'ascending') {
            if (this.input.left) hook.x -= HOOK_LATERAL_SPEED * delta;
            if (this.input.right) hook.x += HOOK_LATERAL_SPEED * delta;
            hook.x = Math.max(WALL_THICKNESS, Math.min(CANVAS_WIDTH - WALL_THICKNESS - HOOK_SIZE, hook.x));
        }

        // Vertical Movement & State Machine
        if (hook.state === 'dropping') {
            hook.y += BASE_HOOK_SPEED * delta;

            // Hit Bottom -> Switch to Ascending (Slow)
            if (hook.y >= WORLD_HEIGHT) {
                hook.state = 'ascending';
                // hook.state = 'bottom_pause'; // Removed pause for now, direct switch
            }

            this.checkCollisions();

        } else if (hook.state === 'ascending') {
            // Slow ascent (same speed as drop)
            hook.y -= BASE_HOOK_SPEED * delta;

            // Hit Surface -> End
            if (hook.y <= 200) {
                this.endRun();
            } else {
                this.checkCollisions();
            }

        } else if (hook.state === 'reeling') {
            // Fast ascent (Full catch)
            hook.y -= BASE_HOOK_SPEED * 2 * delta; 
            
            if (hook.y <= 200) {
                this.endRun();
            }
        }
    }

    private endRun() {
        const hook = this.state.hook;
        hook.state = 'idle';
        hook.y = 200;
        this.handleCatch();
    }

    private checkCollisions() {
        const hook = this.state.hook;
        
        // Don't catch if full
        if (hook.caughtFishes.length >= MAX_CATCH) {
            if (hook.state !== 'reeling') hook.state = 'reeling';
            return;
        }

        for (let i = 0; i < this.state.fishes.length; i++) {
            const fish = this.state.fishes[i];
            
            // Fixed Collision Logic
            // Fish visuals: Nose at (0,0). 
            // If direction 1 (Right): Scale 1. Nose at x, Tail at x - width.
            // If direction -1 (Left): Scale -1. Nose at x, Tail at x + width?
            // Let's verify RenderSystem logic:
            // fish.sprite.scale.x = fish.direction === 1 ? 1 : -1;
            // Graphics: moveTo(0,0), lineTo(-width, ...).
            // So if Scale 1: Nose (0,0) -> (-width, ...). Local x goes 0 to -width.
            // Global x: fish.x to fish.x - width.
            // If Scale -1: Nose (0,0) -> (-width * -1) = width. Local x goes 0 to width.
            // Global x: fish.x to fish.x + width.
            
            let minX, maxX;
            if (fish.direction === 1) {
                // Moving Right. Visuals point right. Tail is to the left.
                // Bounds: [fish.x - width, fish.x]
                minX = fish.x - fish.width;
                maxX = fish.x;
            } else {
                // Moving Left. Visuals point left. Tail is to the right.
                // Bounds: [fish.x, fish.x + fish.width]
                minX = fish.x;
                maxX = fish.x + fish.width;
            }

            const fishY = fish.y - fish.height / 2;
            const fishH = fish.height;

            if (
                hook.x < maxX &&
                hook.x + HOOK_SIZE > minX &&
                hook.y < fishY + fishH &&
                hook.y + HOOK_SIZE > fishY
            ) {
                // Caught!
                hook.caughtFishes.push(fish);
                this.state.fishes.splice(i, 1);
                i--; // Adjust index since we removed one

                // Check if full
                if (hook.caughtFishes.length >= MAX_CATCH) {
                    hook.state = 'reeling';
                }
                // Else continue in current state (dropping or ascending)
            }
        }
    }

    private handleCatch() {
        if (this.state.hook.caughtFishes.length > 0) {
            this.state.hook.caughtFishes.forEach(fish => {
                this.state.score += fish.species.points;
                // Sprite destruction handled by RenderSystem sync
            });
            this.state.hook.caughtFishes = [];
        }
    }

    private updateFish(delta: number) {
        this.state.fishes.forEach(fish => {
            fish.x += fish.speed * fish.direction * delta;
            if (fish.direction === 1 && fish.x > CANVAS_WIDTH + fish.width) {
                fish.direction = -1;
                fish.x = CANVAS_WIDTH + fish.width;
            } else if (fish.direction === -1 && fish.x < -fish.width * 2) {
                fish.direction = 1;
                fish.x = -fish.width * 2;
            }
        });
    }
}
