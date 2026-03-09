// src/features/BulletTest/view/ui-components/BH_HUD.tsx
import React, { useEffect, useState } from 'react';
import { getItemDef, ITEM_NONE } from '../../../../core/inventory/ItemRegistry';

// Sprite paths — 2-frame horizontal spritesheets (64x32, each frame 32x32)
const POINT_SPRITE_PATH = 'res/sprite/sheets/Point.png';
const COIN_SPRITE_PATH = 'res/sprite/sheets/Coin.png';

interface HUDProps {
    hp: number;
    rockCount: number;
    currentWave: number;
    totalWaves: number;
    waveState: string;
    waveDelayTimer: number;
    isRoomCleared: boolean;
    exitDoorActive: boolean;
    exitDoorX: number;
    exitDoorY: number;
    bossHp: number;
    bossVulnerable: boolean;
    points: number;
    coins: number;
    heldItemId: number;
    // Item drop 1
    itemDropActive: boolean;
    itemDropX: number;
    itemDropY: number;
    itemDropType: number;
    itemDropFree: boolean;
    // Item drop 2
    itemDrop2Active: boolean;
    itemDrop2X: number;
    itemDrop2Y: number;
    itemDrop2Type: number;
    itemDrop2Free: boolean;
    gameWidth: number;
    gameHeight: number;
    damageBtnRef: React.RefObject<HTMLButtonElement>;
    onDamage: () => void;
    onJumpToG2: () => void;
    onLevel1: () => void;
    onLevel2: () => void;
    onLevel3: () => void;
    onLevel4: () => void;
    onResetG1: () => void;
    onUseItem: () => void;
}

/**
 * Animated 2-frame sprite icon from a horizontal spritesheet (64x32).
 */
const SpriteIcon: React.FC<{ src: string; size?: string; intervalMs?: number }> = ({
                                                                                       src, size = '5cqw', intervalMs = 500
                                                                                   }) => {
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setFrame(f => (f + 1) % 2), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);

    return (
        <div style={{
            width: size,
            height: size,
            overflow: 'hidden',
            flexShrink: 0,
            marginRight: '0.5cqw',
            imageRendering: 'pixelated',
            position: 'relative'
        }}>
            <img
                src={src}
                alt=""
                draggable={false}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: frame === 0 ? '0%' : '-100%',
                    height: '100%',
                    width: '200%',
                    imageRendering: 'pixelated',
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
};

/**
 * Inventory slot display — shows the currently held item in a bordered box.
 * Passive items show "AUTO" instead of "[Q]".
 */
const InventorySlot: React.FC<{ itemId: number; onUse: () => void }> = ({ itemId, onUse }) => {
    const def = itemId !== ITEM_NONE ? getItemDef(itemId) : null;
    const isEmpty = !def;
    const isPassive = def?.passive ?? false;

    return (
        <div
            onClick={isEmpty || isPassive ? undefined : onUse}
            title={def ? `${def.name} — ${def.description}${isPassive ? ' (auto)' : ' (Q to use)'}` : 'Empty'}
            style={{
                width: '7cqw',
                height: '7cqw',
                border: `0.2cqw solid ${isEmpty ? '#333' : isPassive ? '#ff9f43' : '#4eff4e'}`,
                borderRadius: '0.5cqw',
                backgroundColor: isEmpty ? 'rgba(0,0,0,0.5)' : isPassive ? 'rgba(80,40,0,0.6)' : 'rgba(0,60,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isEmpty || isPassive ? 'default' : 'pointer',
                pointerEvents: 'auto',
                boxShadow: isEmpty ? 'none' : isPassive
                    ? '0 0 12px rgba(255, 159, 67, 0.3)'
                    : '0 0 12px rgba(78, 255, 78, 0.3)',
                transition: 'all 0.2s ease',
                position: 'relative'
            }}
        >
            {def ? (
                <>
                    <img
                        src={def.spriteKey}
                        alt={def.name}
                        draggable={false}
                        style={{
                            width: '5cqw',
                            height: '5cqw',
                            imageRendering: 'pixelated',
                            filter: isPassive
                                ? 'drop-shadow(0 0 4px rgba(255, 159, 67, 0.5))'
                                : 'drop-shadow(0 0 4px rgba(78, 255, 78, 0.5))',
                            pointerEvents: 'none'
                        }}
                    />
                    <div style={{
                        fontSize: '0.6cqw',
                        color: isPassive ? '#ff9f43' : '#4eff4e',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        marginTop: '0.2cqw',
                        textAlign: 'center',
                        textShadow: isPassive
                            ? '0 0 4px rgba(255, 159, 67, 0.5)'
                            : '0 0 4px rgba(78, 255, 78, 0.5)'
                    }}>
                        {isPassive ? 'AUTO' : '[Q]'}
                    </div>
                </>
            ) : (
                <div style={{
                    fontSize: '0.7cqw',
                    color: '#555',
                    fontFamily: 'monospace'
                }}>
                    ITEM
                </div>
            )}
        </div>
    );
};

const PORTAL_SHEET_PATH = 'res/sprite/sheets/portal_sheet.png';
const PORTAL_FRAMES = 7;
const PORTAL_FRAME_SIZE = 32; // each frame is 32x32 in a 224x32 sheet

/**
 * Animated portal sprite rendered from a horizontal spritesheet.
 * Cycles through 7 frames, positioned at the exit door coordinates.
 */
const PortalSprite: React.FC<{
    x: number; y: number; gameWidth: number; gameHeight: number;
}> = ({ x, y, gameWidth, gameHeight }) => {
    const [frame, setFrame] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setFrame(f => (f + 1) % PORTAL_FRAMES), 120);
        return () => clearInterval(id);
    }, []);

    // Display size as percentage of game area — portal_sheet is 32px native, scale up
    const displaySize = '8cqw';

    return (
        <div style={{
            position: 'absolute',
            left: `${(x / gameWidth) * 100}%`,
            top: `${(y / gameHeight) * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: displaySize,
            height: displaySize,
            overflow: 'hidden',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0 0 12px rgba(120, 80, 220, 0.7))',
            pointerEvents: 'none'
        }}>
            <img
                src={PORTAL_SHEET_PATH}
                alt=""
                draggable={false}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: `${-frame * 100}%`,
                    width: `${PORTAL_FRAMES * 100}%`,
                    height: '100%',
                    imageRendering: 'pixelated',
                    pointerEvents: 'none'
                }}
            />
        </div>
    );
};

/**
 * A world-space item drop rendered as a bobbing sprite with coin cost label.
 */
const ItemDropSprite: React.FC<{
    x: number;
    y: number;
    itemType: number;
    free: boolean;
    gameWidth: number;
    gameHeight: number;
}> = ({ x, y, itemType, free, gameWidth, gameHeight }) => {
    const def = getItemDef(itemType);
    if (!def || gameWidth <= 0 || gameHeight <= 0) return null;

    const cost = free ? 0 : (def.cost ?? 0);
    // Color theme: green for active items, orange for passive (Life Totem)
    const isPassive = def.passive ?? false;
    const glowColor = isPassive ? 'rgba(255, 159, 67, 0.6)' : 'rgba(78, 255, 78, 0.6)';
    const textColor = isPassive ? '#ff9f43' : '#4eff4e';

    return (
        <div style={{
            position: 'absolute',
            left: `${(x / gameWidth) * 100}%`,
            top: `${(y / gameHeight) * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: '4%',
            height: '7%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'itemDropBob 1.5s ease-in-out infinite',
            pointerEvents: 'none'
        }}>
            <img
                src={def.spriteKey}
                alt={def.name}
                draggable={false}
                style={{
                    width: '3cqw',
                    height: '3cqw',
                    imageRendering: 'pixelated',
                    filter: `drop-shadow(0 0 8px ${glowColor})`,
                    pointerEvents: 'none'
                }}
            />
            <div style={{
                color: textColor,
                fontFamily: 'monospace',
                fontWeight: 'bold',
                fontSize: '0.7cqw',
                textShadow: `0 0 6px ${glowColor}`,
                marginTop: '0.2cqw',
                textAlign: 'center'
            }}>
                {def.name.toUpperCase()}
            </div>
            {cost > 0 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2cqw',
                    marginTop: '0.1cqw'
                }}>
                    <SpriteIcon src={COIN_SPRITE_PATH} size="1.2cqw" intervalMs={400} />
                    <span style={{
                        color: '#ffd700',
                        fontFamily: 'monospace',
                        fontWeight: 'bold',
                        fontSize: '0.7cqw',
                        textShadow: '0 0 4px rgba(255, 215, 0, 0.5)'
                    }}>
                        {cost}
                    </span>
                </div>
            )}
            {free && (
                <div style={{
                    color: '#2ecc71',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    fontSize: '0.7cqw',
                    textShadow: '0 0 6px rgba(46, 204, 113, 0.5)',
                    marginTop: '0.1cqw'
                }}>
                    FREE
                </div>
            )}
            <div style={{
                color: '#aaa',
                fontFamily: 'monospace',
                fontWeight: 'bold',
                fontSize: '0.6cqw',
                marginTop: '0.2cqw',
                opacity: 0.8
            }}>
                [E]
            </div>
        </div>
    );
};

export const BH_HUD: React.FC<HUDProps> = ({
                                               hp, rockCount, currentWave, totalWaves, waveState, waveDelayTimer, isRoomCleared,
                                               exitDoorActive, exitDoorX, exitDoorY, bossHp, bossVulnerable,
                                               points, coins,
                                               heldItemId,
                                               itemDropActive, itemDropX, itemDropY, itemDropType, itemDropFree,
                                               itemDrop2Active, itemDrop2X, itemDrop2Y, itemDrop2Type, itemDrop2Free,
                                               gameWidth, gameHeight,
                                               damageBtnRef,
                                               onDamage, onJumpToG2, onLevel1, onLevel2, onLevel3, onLevel4, onResetG1,
                                               onUseItem
                                           }) => {
    const getWaveStatusText = (): string => {
        if (isRoomCleared) return 'ROOM CLEARED!';
        if (waveState === 'DELAY') return `NEXT WAVE IN ${Math.ceil(waveDelayTimer / 60)}s`;
        if (waveState === 'ACTIVE') return `ENEMIES: ${rockCount}`;
        if (waveState === 'CLEARED') return 'WAVE CLEARED!';
        return 'STANDBY';
    };

    const getWaveStatusColor = (): string => {
        if (isRoomCleared) return '#f1c40f';
        if (waveState === 'DELAY') return '#e67e22';
        if (waveState === 'ACTIVE') return '#e74c3c';
        if (waveState === 'CLEARED') return '#2ecc71';
        return '#888';
    };

    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', containerType: 'size' }}>

            {/* Top-left: Points & Coins */}
            <div style={{
                position: 'absolute', top: '2cqh', left: '2cqw',
                display: 'flex', alignItems: 'center', gap: '1.5cqw',
                fontFamily: 'monospace', fontSize: '1.4cqw', fontWeight: 'bold'
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center',
                    color: '#f1c40f',
                    textShadow: '0 0 8px rgba(241, 196, 15, 0.4)'
                }}>
                    <SpriteIcon src={POINT_SPRITE_PATH} />
                    <span>{points.toLocaleString()}</span>
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center',
                    color: '#ffd700',
                    textShadow: '0 0 8px rgba(255, 215, 0, 0.4)'
                }}>
                    <SpriteIcon src={COIN_SPRITE_PATH} />
                    <span>{coins.toLocaleString()}</span>
                </div>
            </div>

            {/* Wave Info - Top Right */}
            <div style={{
                position: 'absolute', top: '3cqh', right: '3cqw',
                color: '#fff', fontFamily: 'monospace', textAlign: 'right', fontSize: '1.2cqw'
            }}>
                <div style={{
                    color: getWaveStatusColor(),
                    fontSize: '1.4cqw', fontWeight: 'bold', marginBottom: '0.5cqh'
                }}>
                    WAVE {currentWave + 1} / {totalWaves}
                </div>
                <div style={{ color: getWaveStatusColor(), fontSize: '1cqw' }}>
                    {getWaveStatusText()}
                </div>
            </div>

            {/* Exit Portal */}
            {exitDoorActive && gameWidth > 0 && gameHeight > 0 && (
                <PortalSprite
                    x={exitDoorX}
                    y={exitDoorY}
                    gameWidth={gameWidth}
                    gameHeight={gameHeight}
                />
            )}

            {exitDoorActive && (
                <style>{`
                    @keyframes itemDropBob {
                        0%, 100% { transform: translate(-50%, -50%) translateY(0); }
                        50% { transform: translate(-50%, -50%) translateY(-8px); }
                    }
                `}</style>
            )}

            {/* Item Drop 1 (Health Potion — left of portal) */}
            {itemDropActive && (
                <ItemDropSprite
                    x={itemDropX}
                    y={itemDropY}
                    itemType={itemDropType}
                    free={itemDropFree}
                    gameWidth={gameWidth}
                    gameHeight={gameHeight}
                />
            )}

            {/* Item Drop 2 (Life Totem — right of portal) */}
            {itemDrop2Active && (
                <ItemDropSprite
                    x={itemDrop2X}
                    y={itemDrop2Y}
                    itemType={itemDrop2Type}
                    free={itemDrop2Free}
                    gameWidth={gameWidth}
                    gameHeight={gameHeight}
                />
            )}

            {/* Delay Countdown Overlay */}
            {waveState === 'DELAY' && waveDelayTimer > 0 && (
                <div style={{
                    position: 'absolute', top: '35%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#e67e22', fontFamily: 'monospace',
                    fontSize: '2cqw', fontWeight: 'bold',
                    textShadow: '0 0 15px rgba(230, 126, 34, 0.5)',
                    textAlign: 'center', opacity: 0.9
                }}>
                    WAVE {currentWave + 1} INCOMING
                    <div style={{ fontSize: '4cqw', color: '#fff', marginTop: '0.5cqh' }}>
                        {Math.ceil(waveDelayTimer / 60)}
                    </div>
                </div>
            )}

            {/* Bottom-left: Inventory Slot */}
            <div style={{
                position: 'absolute', bottom: '3cqh', left: '3cqw',
                display: 'flex', alignItems: 'flex-end'
            }}>
                <InventorySlot itemId={heldItemId} onUse={onUseItem} />
            </div>
        </div>
    );
};