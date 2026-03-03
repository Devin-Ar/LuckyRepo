// src/core/session/GlobalSessionMap.ts

export const GLOBAL_SESSION_MAP: Record<string, string> = {
    hp: 'global_hp',
    energy: 'global_energy',
    points: 'global_points',
    coins: 'global_coins',
};

export type GlobalSessionKey = keyof typeof GLOBAL_SESSION_MAP;