// src/core/registry/InputRegistry.ts
export const INPUT_REGISTRY: Record<string, Record<string, { keys: string[], label: string }>> = {
    "Shared": {
        "UI_BACK": { keys: ["ESCAPE", "BACKSPACE"], label: "Back" },
        "PAUSE": { keys: ["ESCAPE", "P"], label: "Pause" },
    },
    "Game1": {
        "MOVE_UP": { keys: ["W", "ARROWUP"], label: "Move Up" },
        "MOVE_DOWN": { keys: ["S", "ARROWDOWN"], label: "Move Down" },
        "MOVE_LEFT": { keys: ["A", "ARROWLEFT"], label: "Move Left" },
        "MOVE_RIGHT": { keys: ["D", "ARROWRIGHT"], label: "Move Right" },
    },
    "Game2": {
        "MOVE_UP": { keys: ["G", "H"], label: "Unused" },
    },
    "BHGame": {
        "MOVE_UP": { keys: ["W", "ARROWUP"], label: "Move Up" },
        "MOVE_DOWN": { keys: ["S", "ARROWDOWN"], label: "Move Down" },
        "MOVE_LEFT": { keys: ["A", "ARROWLEFT"], label: "Move Left" },
        "MOVE_RIGHT": { keys: ["D", "ARROWRIGHT"], label: "Move Right" },
    },
    "Game3": {
        "MOVE_LEFT": { keys: ["A", "ARROWLEFT"], label: "Move Left" },
        "MOVE_RIGHT": { keys: ["D", "ARROWRIGHT"], label: "Move Right" },
        "MOVE_DOWN": { keys: ["S", "ARROWDOWN"], label: "Move Down" },
        "JUMP": { keys: ["W", "ARROWUP", " "], label: "Jump" }
    }
};