import type { FishSpecies } from '../types';

export const FISH_LIBRARY: FishSpecies[] = [
    // --- SURFACE / SHALLOW (0 - 50m) ---
    // Common
    { name: 'Sardine', sizeCm: 15, depthMin: 0, depthMax: 50, points: 5, rarity: 'common', color: 0xC0C0C0 },
    { name: 'Anchovy', sizeCm: 10, depthMin: 0, depthMax: 40, points: 5, rarity: 'common', color: 0xB0C4DE },
    { name: 'Mackerel', sizeCm: 30, depthMin: 0, depthMax: 60, points: 10, rarity: 'common', color: 0x006994 },
    { name: 'Clownfish', sizeCm: 10, depthMin: 0, depthMax: 20, points: 10, rarity: 'common', color: 0xFF7F50 },
    { name: 'Blue Tang', sizeCm: 25, depthMin: 0, depthMax: 30, points: 15, rarity: 'common', color: 0x0000FF },
    { name: 'Sea Bass', sizeCm: 40, depthMin: 5, depthMax: 50, points: 20, rarity: 'common', color: 0x708090 },
    // Magic
    { name: 'Pufferfish', sizeCm: 30, depthMin: 0, depthMax: 40, points: 30, rarity: 'magic', color: 0xFFFFE0 },
    { name: 'Butterflyfish', sizeCm: 15, depthMin: 5, depthMax: 40, points: 25, rarity: 'magic', color: 0xFFFF00 },
    // Rare
    { name: 'Parrotfish', sizeCm: 40, depthMin: 10, depthMax: 50, points: 50, rarity: 'rare', color: 0x00FF00 },
    // Legendary
    { name: 'Golden Dorade', sizeCm: 50, depthMin: 0, depthMax: 50, points: 200, rarity: 'legendary', color: 0xFFD700 },

    // --- TWILIGHT ZONE / MEDIUM (50 - 200m) ---
    // Common
    { name: 'Cod', sizeCm: 60, depthMin: 50, depthMax: 200, points: 30, rarity: 'common', color: 0x8B4513 },
    { name: 'Haddock', sizeCm: 50, depthMin: 60, depthMax: 200, points: 30, rarity: 'common', color: 0xA9A9A9 },
    { name: 'Pollock', sizeCm: 55, depthMin: 50, depthMax: 180, points: 30, rarity: 'common', color: 0x778899 },
    { name: 'Red Snapper', sizeCm: 60, depthMin: 40, depthMax: 120, points: 50, rarity: 'common', color: 0xFF4444 },
    { name: 'Grouper', sizeCm: 80, depthMin: 50, depthMax: 150, points: 60, rarity: 'common', color: 0x556B2F },
    // Magic
    { name: 'Barracuda', sizeCm: 100, depthMin: 20, depthMax: 150, points: 80, rarity: 'magic', color: 0xAAAAAA },
    { name: 'Mahi Mahi', sizeCm: 100, depthMin: 50, depthMax: 150, points: 90, rarity: 'magic', color: 0x00FF7F },
    // Rare
    { name: 'Yellowfin Tuna', sizeCm: 150, depthMin: 50, depthMax: 300, points: 150, rarity: 'rare', color: 0xFFFFAA },
    { name: 'Swordfish', sizeCm: 200, depthMin: 100, depthMax: 300, points: 180, rarity: 'rare', color: 0x4B0082 },
    // Legendary
    { name: 'Blue Marlin', sizeCm: 300, depthMin: 100, depthMax: 400, points: 500, rarity: 'legendary', color: 0x4444FF },

    // --- MIDNIGHT ZONE / DEEP (200 - 1000m) ---
    // Common
    { name: 'Lanternfish', sizeCm: 10, depthMin: 200, depthMax: 1000, points: 40, rarity: 'common', color: 0xFFFF00 },
    { name: 'Bristlemouth', sizeCm: 8, depthMin: 200, depthMax: 1000, points: 35, rarity: 'common', color: 0x696969 },
    { name: 'Hake', sizeCm: 70, depthMin: 200, depthMax: 600, points: 50, rarity: 'common', color: 0x808080 },
    { name: 'Monkfish', sizeCm: 90, depthMin: 300, depthMax: 800, points: 60, rarity: 'common', color: 0x8B0000 },
    // Magic
    { name: 'Hatchetfish', sizeCm: 10, depthMin: 200, depthMax: 800, points: 80, rarity: 'magic', color: 0xC0C0C0 },
    { name: 'Oarfish', sizeCm: 600, depthMin: 200, depthMax: 1000, points: 150, rarity: 'magic', color: 0xE0FFFF },
    // Rare
    { name: 'Anglerfish', sizeCm: 30, depthMin: 300, depthMax: 1000, points: 200, rarity: 'rare', color: 0x440000 },
    { name: 'Goblin Shark', sizeCm: 300, depthMin: 300, depthMax: 1200, points: 250, rarity: 'rare', color: 0xFFAAAA },
    // Legendary
    { name: 'Giant Squid', sizeCm: 1000, depthMin: 500, depthMax: 2000, points: 1000, rarity: 'legendary', color: 0xFF0000 },

    // --- ABYSS (1000 - 4000m) ---
    // Common
    { name: 'Grenadier', sizeCm: 50, depthMin: 1000, depthMax: 4000, points: 80, rarity: 'common', color: 0x5F9EA0 },
    { name: 'Cusk Eel', sizeCm: 60, depthMin: 1000, depthMax: 4000, points: 85, rarity: 'common', color: 0xBC8F8F },
    { name: 'Cutthroat Eel', sizeCm: 40, depthMin: 1000, depthMax: 3000, points: 90, rarity: 'common', color: 0x708090 },
    // Magic
    { name: 'Viperfish', sizeCm: 40, depthMin: 1000, depthMax: 4000, points: 150, rarity: 'magic', color: 0x00FF00 },
    { name: 'Dragonfish', sizeCm: 25, depthMin: 1000, depthMax: 3000, points: 160, rarity: 'magic', color: 0x000000 },
    // Rare
    { name: 'Gulper Eel', sizeCm: 100, depthMin: 1000, depthMax: 3000, points: 300, rarity: 'rare', color: 0x220022 },
    { name: 'Fangtooth', sizeCm: 15, depthMin: 1000, depthMax: 4000, points: 280, rarity: 'rare', color: 0x4B0082 },
    // Legendary
    { name: 'Coelacanth', sizeCm: 150, depthMin: 1000, depthMax: 3000, points: 2000, rarity: 'legendary', color: 0x000080 },

    // --- HADAL ZONE / TRENCH (4000m+) ---
    // Common
    { name: 'Snailfish', sizeCm: 20, depthMin: 4000, depthMax: 8000, points: 150, rarity: 'common', color: 0xFFC0CB },
    { name: 'Amphipod', sizeCm: 5, depthMin: 4000, depthMax: 10000, points: 100, rarity: 'common', color: 0xFFFFFF },
    { name: 'Sea Cucumber', sizeCm: 15, depthMin: 4000, depthMax: 11000, points: 120, rarity: 'common', color: 0x8B4513 },
    // Magic
    { name: 'Tripod Fish', sizeCm: 30, depthMin: 4000, depthMax: 7000, points: 300, rarity: 'magic', color: 0xD3D3D3 },
    { name: 'Ghost Shark', sizeCm: 100, depthMin: 4000, depthMax: 8000, points: 400, rarity: 'magic', color: 0xE6E6FA },
    // Rare
    { name: 'Ethereal Snailfish', sizeCm: 25, depthMin: 6000, depthMax: 9000, points: 800, rarity: 'rare', color: 0xFF69B4 },
    // Legendary
    { name: 'Megalodon', sizeCm: 1800, depthMin: 5000, depthMax: 8000, points: 50000, rarity: 'legendary', color: 0x708090 },
    { name: 'The Kraken', sizeCm: 5000, depthMin: 9000, depthMax: 11000, points: 100000, rarity: 'legendary', color: 0x880088 }
];
