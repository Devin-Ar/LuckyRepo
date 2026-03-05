// src/core/inventory/ItemRegistry.ts

export interface ItemDefinition {
    id: number;
    name: string;
    description: string;
    spriteKey: string;       // Key used to render in HUD (image name or sheet reference)
    onUse?: (context: { hp: number; maxHp: number }) => { hpDelta: number } | null;
}

// Item ID 0 = empty/no item
export const ITEM_NONE = 0;
export const ITEM_HEALTH_POTION = 1;

const ITEMS: Map<number, ItemDefinition> = new Map();

function register(item: ItemDefinition) {
    ITEMS.set(item.id, item);
}

// Item Definitions

register({
    id: ITEM_HEALTH_POTION,
    name: "Health Potion",
    description: "Restores 30 HP when consumed.",
    spriteKey: "res/sprite/sheets/HealthPotion.png",
    onUse: (ctx) => {
        if (ctx.hp >= ctx.maxHp) return null; // Already full, don't consume
        return { hpDelta: 30 };
    }
});

// Public API

export function getItemDef(id: number): ItemDefinition | undefined {
    return ITEMS.get(id);
}

export function getAllItems(): ItemDefinition[] {
    return Array.from(ITEMS.values());
}