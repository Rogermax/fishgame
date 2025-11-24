import type { InputState } from '../../types';

export class InputSystem {
    private input: InputState;

    constructor(inputState: InputState) {
        this.input = inputState;
    }

    // Input state is updated by React event listeners in Game.tsx
    // This system primarily exposes the current state to other systems if needed,
    // or could handle more complex input logic (e.g. combos, gestures) in the future.
    
    get state(): InputState {
        return this.input;
    }

    update() {
        // Currently no per-frame input logic needed as state is reactive
    }
}
