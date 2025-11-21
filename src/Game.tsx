import React, { useEffect, useRef } from 'react';
import { Application } from 'pixi.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT, HOOK_SIZE } from './constants';
import type { GameState, InputState } from './types';
import { GameEngine } from './game/GameEngine';

const Game: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  
  // Game State Refs (mutable for Pixi loop)
  const gameState = useRef<GameState>({
    hook: { x: CANVAS_WIDTH / 2, y: 200, state: 'idle', caughtFish: null },
    fishes: [],
    score: 0,
    depth: 0,
    cameraY: 0,
    bottomTimer: 0,
    debug: false
  });

  const inputState = useRef<InputState>({
    left: false,
    right: false,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Pixi App
    const app = new Application();
    let destroyed = false;
    
    const initApp = async () => {
        await app.init({ 
            width: CANVAS_WIDTH, 
            height: CANVAS_HEIGHT, 
            backgroundColor: 0x222222,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });
        
        if (destroyed) {
            app.destroy(true, { children: true, texture: true });
            return;
        }
        
        // Apply CSS to canvas for responsive mobile sizing
        app.canvas.style.width = '100%';
        app.canvas.style.height = '100%';
        app.canvas.style.maxWidth = '56.25vh'; // 9:16 aspect ratio constraint
        app.canvas.style.maxHeight = '100vh';
        app.canvas.style.objectFit = 'contain';
        app.canvas.style.border = '2px solid #444';
        app.canvas.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
        
        if (containerRef.current) {
            containerRef.current.appendChild(app.canvas);
        }
        appRef.current = app;

        // Initialize Game Engine
        const engine = new GameEngine(app, gameState.current, inputState.current);
        await engine.setup();
        engineRef.current = engine;

        // Game Loop
        app.ticker.add((ticker) => {
            engine.update(ticker.deltaTime);
        });
    };

    initApp();

    return () => {
        destroyed = true;
        if (appRef.current) {
            appRef.current.destroy(true, { children: true, texture: true });
            if (containerRef.current && appRef.current.canvas && containerRef.current.contains(appRef.current.canvas)) {
                containerRef.current.removeChild(appRef.current.canvas);
            }
            appRef.current = null;
            engineRef.current = null;
        }
    };
  }, []);

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') inputState.current.left = true;
      if (e.key === 'ArrowRight') inputState.current.right = true;
      if (e.key === ' ' || e.key === 'ArrowDown') {
          if (gameState.current.hook.state === 'idle') gameState.current.hook.state = 'dropping';
      }
      if (e.key === 'd' || e.key === 'D') gameState.current.debug = !gameState.current.debug;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') inputState.current.left = false;
      if (e.key === 'ArrowRight') inputState.current.right = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleTouch = (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const x = (clientX - rect.left) * scaleX;
      
      if (gameState.current.hook.state !== 'reeling') {
           gameState.current.hook.x = x - HOOK_SIZE/2; 
      }
  };

  return (
    <div 
        ref={containerRef} 
        style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh', 
            background: '#111',
            overflow: 'hidden'
        }}
        onMouseDown={() => { if (gameState.current.hook.state === 'idle') gameState.current.hook.state = 'dropping'; }}
        onMouseMove={(e) => { if(e.buttons === 1) handleTouch(e.clientX); }}
        onTouchStart={() => { if (gameState.current.hook.state === 'idle') gameState.current.hook.state = 'dropping'; }}
        onTouchMove={(e) => handleTouch(e.touches[0].clientX)}
    />
  );
};

export default Game;
