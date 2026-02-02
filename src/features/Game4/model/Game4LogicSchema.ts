// src/features/Game4/model/Game4LogicSchema.ts
import { IBuffer } from "../../../core/interfaces/IBuffer";

/**
 * SharedArrayBuffer layout for Game4.
 *
 * Compared to the old schema the entity section is now generic:
 * each entity occupies ENTITY_STRIDE floats so the view layer can
 * render any enemy type without knowing its class.
 *
 * Per-entity layout (7 floats):
 *   [+0] typeId   — numeric ID mapped from the string type (see EnemyTypeIds)
 *   [+1] x
 *   [+2] y
 *   [+3] vx
 *   [+4] vy
 *   [+5] hp
 *   [+6] seed
 */
export const Game4LogicSchema: IBuffer = {
    // Hero fields
    HERO_HP: 0,
    HERO_X: 1,
    HERO_Y: 2,

    // Frame / timing
    TICK_COUNT: 3,
    FRAME_COUNT: 4,
    FPS: 5,
    REVISION: 6,
    LAST_HIT_FRAME: 7,

    // Entity bookkeeping
    ENTITY_COUNT: 8,

    // Entity data region
    ENTITIES_START_INDEX: 10,
    ENTITY_STRIDE: 7,      // typeId, x, y, vx, vy, hp, seed
    MAX_ENTITIES: 500,

    BUFFER_SIZE: 4096
};

/**
 * Numeric type IDs written into the SAB so the view layer can
 * choose the correct sprite/sheet without parsing strings.
 *
 * Keep this in sync with every enemy type you register.
 */
export const EnemyTypeIds: Record<string, number> = {
    rock:   1,
    bat:    2,
    sentry: 3
};

/** Reverse lookup: typeId → type string. */
export const EnemyTypeNames: Record<number, string> = Object.fromEntries(
    Object.entries(EnemyTypeIds).map(([name, id]) => [id, name])
);