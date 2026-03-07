// src/core/inventory/ItemRegistry.ts

export interface ItemUseResult {
    hpDelta?: number;
    revive?: boolean;  // If true, grants an extra life (auto-triggers on death)
}

export interface ItemDefinition {
    id: number;
    name: string;
    description: string;
    spriteKey: string;       // Key used to render in HUD (image name or sheet reference)
    cost: number;            // Coin cost to pick up from shop drop
    passive?: boolean;       // If true, item triggers automatically (e.g. on death) rather than via Q
    onUse?: (context: { hp: number; maxHp: number }) => ItemUseResult | null;
}

// Item ID 0 = empty/no item
export const ITEM_NONE = 0;
export const ITEM_HEALTH_POTION = 1;
export const ITEM_LIFE_TOTEM = 2;
export const ITEM_MYSTERY_POTION = 3;

/** All item IDs that can appear as shop drops beside the portal */
export const SHOP_ITEM_POOL = [ITEM_HEALTH_POTION, ITEM_LIFE_TOTEM, ITEM_MYSTERY_POTION];

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
    cost: 50,
    onUse: (ctx) => {
        if (ctx.hp >= ctx.maxHp) return null; // Already full, don't consume
        return { hpDelta: 30 };
    }
});

register({
    id: ITEM_LIFE_TOTEM,
    name: "Life Totem",
    description: "Grants an extra life. Automatically revives you at 50 HP when you would die.",
    spriteKey: "res/sprite/sheets/LifeTotem.png",
    cost: 100,
    passive: true,
    onUse: (_ctx) => {
        // This is triggered automatically on death — always consume and revive
        return { revive: true, hpDelta: 50 };
    }
});

register({
    id: ITEM_MYSTERY_POTION,
    name: "Mystery Potion",
    description: "A gamble! Randomly heals 50 HP or damages you for 20 HP.",
    spriteKey: "res/sprite/sheets/mystery_potion.png",
    cost: 25,
    onUse: (_ctx) => {
        const lucky = Math.random() < 0.5;
        return { hpDelta: lucky ? 50 : -20 };
    }
});

// Public API

export function getItemDef(id: number): ItemDefinition | undefined {
    return ITEMS.get(id);
}

export function getAllItems(): ItemDefinition[] {
    return Array.from(ITEMS.values());
}