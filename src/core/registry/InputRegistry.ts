// src/core/registry/InputRegistry.ts
export const INPUT_REGISTRY: Record<string, Record<string, string[]>> = {
    "Shared": {
        "PAUSE": ["ESCAPE", "P"],
    },
    "Game1": {
        "MOVE_UP": ["W", "ARROWUP"],
        "MOVE_DOWN": ["S", "ARROWDOWN"],
        "MOVE_LEFT": ["A", "ARROWLEFT"],
        "MOVE_RIGHT": ["D", "ARROWRIGHT"],
    },
    "Game2": {
        "MOVE_UP": ["G", "H"],
    },
    "BHTest": {
        "MOVE_UP": ["W", "ARROWUP"],
        "MOVE_DOWN": ["S", "ARROWDOWN"],
        "MOVE_LEFT": ["A", "ARROWLEFT"],
        "MOVE_RIGHT": ["D", "ARROWRIGHT"],
    }
};