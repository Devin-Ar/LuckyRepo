// src/features/BulletTest/view/BHView.tsx
import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';
import { Stage } from '@pixi/react';
import { BHPresenter } from './BHPresenter';
import { BHController } from './BHController';
import { StateManager } from '../../../core/managers/StateManager';
import { IGameViewProps } from '../../../core/interfaces/IViewProps';
import { BHLevel } from "../model/BHConfig";

import { BHSimulation } from './ui-components/BHSimulation';
import { BH_HUD } from './ui-components/BH_HUD';
import {DebugContext} from "../../../App";

export const BHView: React.FC<IGameViewProps<BHPresenter, BHController>> = ({
                                                                                vm, controller, width = 960, height = 540
                                                                            }) => {
    const [hpState, setHpState] = useState(vm.hp);
    const [rockCount, setRockCount] = useState(vm.entityCount);
    const [isPaused, setIsPaused] = useState(false);

    // Wave state
    const [currentWave, setCurrentWave] = useState(vm.currentWave);
    const [totalWaves, setTotalWaves] = useState(vm.totalWaves);
    const [waveState, setWaveState] = useState(vm.waveState);
    const [waveDelayTimer, setWaveDelayTimer] = useState(vm.waveDelayTimer);
    const [isRoomCleared, setIsRoomCleared] = useState(vm.isRoomCleared);

    // Exit door
    const [exitDoorActive, setExitDoorActive] = useState(vm.exitDoorActive);
    const [exitDoorX, setExitDoorX] = useState(vm.exitDoorX);
    const [exitDoorY, setExitDoorY] = useState(vm.exitDoorY);

    // Boss state
    const [bossHp, setBossHp] = useState(vm.bossHp);
    const [bossVulnerable, setBossVulnerable] = useState(vm.bossVulnerable);

    // Economy
    const [points, setPoints] = useState(vm.points);
    const [coins, setCoins] = useState(vm.coins);

    // Inventory
    const [heldItemId, setHeldItemId] = useState(vm.heldItem);

    // Item drop 1
    const [itemDropActive, setItemDropActive] = useState(vm.itemDropActive);
    const [itemDropX, setItemDropX] = useState(vm.itemDropX);
    const [itemDropY, setItemDropY] = useState(vm.itemDropY);
    const [itemDropType, setItemDropType] = useState(vm.itemDropType);
    const [itemDropFree, setItemDropFree] = useState(vm.itemDropFree);

    // Item drop 2
    const [itemDrop2Active, setItemDrop2Active] = useState(vm.itemDrop2Active);
    const [itemDrop2X, setItemDrop2X] = useState(vm.itemDrop2X);
    const [itemDrop2Y, setItemDrop2Y] = useState(vm.itemDrop2Y);
    const [itemDrop2Type, setItemDrop2Type] = useState(vm.itemDrop2Type);
    const [itemDrop2Free, setItemDrop2Free] = useState(vm.itemDrop2Free);

    //debug
    const debugging = useContext(DebugContext);

    const damageBtnRef = useRef<HTMLButtonElement>(null);
    const heroPosRef = useRef({ x: vm.pos.x, y: vm.pos.y });
    useEffect(() => {
        const unsubscribe = vm.subscribe(() => {
            const stateManager = StateManager.getInstance();
            const activeState = stateManager.getActiveState();
            const pausedStatus = activeState?.name !== "BHGame";
            if (isPaused !== pausedStatus) setIsPaused(pausedStatus);

            const currentHp = vm.hp;
            heroPosRef.current.x = vm.pos.x;
            heroPosRef.current.y = vm.pos.y;

            if (Math.abs(hpState - currentHp) > 1) setHpState(currentHp);
            if (rockCount !== vm.entityCount) setRockCount(vm.entityCount);

            // Update wave state
            setCurrentWave(vm.currentWave);
            setTotalWaves(vm.totalWaves);
            setWaveState(vm.waveState);
            setWaveDelayTimer(vm.waveDelayTimer);
            setIsRoomCleared(vm.isRoomCleared);

            // Exit door
            setExitDoorActive(vm.exitDoorActive);
            setExitDoorX(vm.exitDoorX);
            setExitDoorY(vm.exitDoorY);

            // Boss state
            setBossHp(vm.bossHp);
            setBossVulnerable(vm.bossVulnerable);

            // Economy
            setPoints(vm.points);
            setCoins(vm.coins);

            // Inventory
            setHeldItemId(vm.heldItem);

            // Item drop 1
            setItemDropActive(vm.itemDropActive);
            setItemDropX(vm.itemDropX);
            setItemDropY(vm.itemDropY);
            setItemDropType(vm.itemDropType);
            setItemDropFree(vm.itemDropFree);

            // Item drop 2
            setItemDrop2Active(vm.itemDrop2Active);
            setItemDrop2X(vm.itemDrop2X);
            setItemDrop2Y(vm.itemDrop2Y);
            setItemDrop2Type(vm.itemDrop2Type);
            setItemDrop2Free(vm.itemDrop2Free);
        });
        return () => unsubscribe();
    }, [vm, hpState, rockCount, isPaused]);

    const scaleFactor = useMemo(() => width / 960, [width]);

    return (
        <div style={{
            position: 'absolute', inset: 0, background: '#000',
            overflow: 'hidden', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                position: 'relative', width: '100%', height: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <Stage
                    key={`stage-${width}-${height}`}
                    width={width} height={height}
                    options={{ backgroundColor: 0x000, antialias: true, resolution: 1, autoDensity: false }}
                    style={{
                        display: 'block', width: '100%', height: '100%',
                        objectFit: 'contain', imageRendering: 'pixelated'
                    }}
                >
                    <DebugContext.Provider value={debugging}>
                    <BHSimulation
                        vm={vm} paused={isPaused}
                        width={width} height={height}
                        scale={scaleFactor} heroPos={heroPosRef} hp={hpState}
                    />
                    </DebugContext.Provider>
                </Stage>
            </div>

            <BH_HUD
                hp={hpState}
                rockCount={rockCount}
                currentWave={currentWave}
                totalWaves={totalWaves}
                waveState={waveState}
                waveDelayTimer={waveDelayTimer}
                isRoomCleared={isRoomCleared}
                exitDoorActive={exitDoorActive}
                exitDoorX={exitDoorX}
                exitDoorY={exitDoorY}
                bossHp={bossHp}
                bossVulnerable={bossVulnerable}
                points={points}
                coins={coins}
                heldItemId={heldItemId}
                itemDropActive={itemDropActive}
                itemDropX={itemDropX}
                itemDropY={itemDropY}
                itemDropType={itemDropType}
                itemDropFree={itemDropFree}
                itemDrop2Active={itemDrop2Active}
                itemDrop2X={itemDrop2X}
                itemDrop2Y={itemDrop2Y}
                itemDrop2Type={itemDrop2Type}
                itemDrop2Free={itemDrop2Free}
                gameWidth={width}
                gameHeight={height}
                damageBtnRef={damageBtnRef}
                onDamage={() => controller.takeDamage()}
                onJumpToG2={() => controller.jumpToGame2()}
                onLevel1={() => controller.loadLevel(BHLevel.Level1)}
                onLevel2={() => controller.loadLevel(BHLevel.Level2)}
                onLevel3={() => controller.loadLevel(BHLevel.Level3)}
                onLevel4={() => controller.loadLevel(BHLevel.Level4)}
                onResetG1={() => controller.resetLevel()}
                onUseItem={() => controller.useItem()}
            />
        </div>
    );
};