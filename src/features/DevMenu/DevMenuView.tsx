import React, { useState } from 'react';
import { StateRegistry } from "../../core/registry/StateRegistry";
import { StateId } from "../../core/registry/StateId";
import { DevMenuController } from './DevMenuController';

interface DevBtnProps {
    label: string;
    onClick?: () => void;
    active?: boolean;
    color?: string;
    subLabel?: string;
}

const DevButton = ({label, onClick, active, color = "#444", subLabel}: DevBtnProps) => (
    <button
        onClick={onClick}
        disabled={!onClick}
        style={{
            padding: '1cqw',
            backgroundColor: active ? '#4f4' : (onClick ? color : '#222'),
            color: active ? '#000' : (onClick ? '#fff' : '#666'),
            border: '0.1cqw solid #555',
            borderRadius: '0.4cqw',
            cursor: onClick ? 'pointer' : 'default',
            fontSize: '0.8cqw',
            fontWeight: 'bold',
            textAlign: 'center',
            transition: 'all 0.1s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}
    >
        <span>{label}</span>
        {subLabel && <span style={{fontSize: '0.6cqw', fontWeight: 'normal', opacity: 0.8}}>{subLabel}</span>}
    </button>
);

const AudioSlider = ({label, value, onChange}: { label: string, value: number, onChange: (v: number) => void }) => (
    <div style={{marginBottom: '1.2cqw'}}>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.7cqw',
            color: '#00ff00',
            marginBottom: '0.4cqw'
        }}>
            <span>{label}</span>
            <span>{Math.round(value * 100)}%</span>
        </div>
        <input
            type="range" min="0" max="1" step="0.01"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            style={{width: '100%', cursor: 'pointer', accentColor: '#00ff00', height: '0.8cqh'}}
        />
    </div>
);

interface DevMenuViewProps {
    controller: DevMenuController;
    res?: string;
    setRes?: (r: any) => void;
}

export const DevMenuView: React.FC<DevMenuViewProps> = ({ controller, res, setRes }) => {
    const game1 = StateRegistry.get(StateId.GAME_1);
    const game2 = StateRegistry.get(StateId.GAME_2);
    const bhGame = StateRegistry.get(StateId.BH_GAME);

    const [vols, setVols] = useState(controller.getInitialVolumes());

    const handleVolChange = (cat: 'master' | 'ost' | 'sfx', val: number) => {
        controller.setVolume(cat, val);
        setVols(prev => ({...prev, [cat]: val}));
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div style={{
            position: 'absolute', inset: 0,
            background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'relative',
                width: '100%', height: '100%',
                maxWidth: 'calc(100vh * (16 / 9))',
                maxHeight: 'calc(100vw * (9 / 16))',
                aspectRatio: '16 / 9',
                backgroundColor: '#0a0a0a', color: '#00ff00',
                padding: '2cqw', boxSizing: 'border-box', fontFamily: 'monospace',
                border: '0.2cqw solid #333', display: 'flex', gap: '2cqw',
                containerType: 'size'
            }}>
                <div style={{flex: 2}}>
                    <h2 style={{
                        fontSize: '2cqw',
                        letterSpacing: '0.2cqw',
                        borderBottom: '0.1cqw solid #333',
                        paddingBottom: '1cqw',
                        margin: 0,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>DEV_SWITCHBOARD_V1</span>
                    </h2>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '1.5cqw',
                        marginTop: '2cqw'
                    }}>
                        <div style={{gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '0.5cqw'}}>
                            <div style={{fontSize: '0.8cqw', color: '#e74c3c', marginBottom: '0.5cqw'}}>CAMPAIGN_MODES</div>
                            <div style={{display: 'flex', gap: '1cqw'}}>
                                <div style={{flex:1}}>
                                    <DevButton
                                        label="STORY MODE"
                                        subLabel="Full Progression"
                                        onClick={() => controller.startCampaign('story_mode')}
                                        color="#e74c3c"
                                    />
                                </div>
                                <div style={{flex:1}}>
                                    <DevButton
                                        label="ARCADE MODE"
                                        subLabel="Quick Action"
                                        onClick={() => controller.startCampaign('arcade_mode')}
                                        color="#f39c12"
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5cqw'}}>
                            <div style={{fontSize: '0.8cqw', color: '#888', marginBottom: '0.5cqw'}}>
                                MODULE: {game1?.displayName.toUpperCase() ?? "GAME_01"}
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5cqw'}}>
                                <DevButton
                                    label="LVL 1"
                                    onClick={() => controller.handleNav(StateId.GAME_1, game1?.presets?.[0]?.params)}
                                    color="#27ae60"
                                />
                                <DevButton
                                    label="LVL 2"
                                    onClick={() => controller.handleNav(StateId.GAME_1, game1?.presets?.[1]?.params)}
                                    color="#2980b9"
                                />
                                <DevButton
                                    label="LVL 3"
                                    onClick={() => controller.handleNav(StateId.GAME_1, game1?.presets?.[2]?.params)}
                                    color="#8e44ad"
                                />
                            </div>
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5cqw'}}>
                            <div style={{fontSize: '0.8cqw', color: '#888', marginBottom: '0.5cqw'}}>
                                MODULE: {game2?.displayName.toUpperCase() ?? "GAME_02"}
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5cqw'}}>
                                <DevButton
                                    label="LVL 1"
                                    onClick={() => controller.handleNav(StateId.GAME_2, game2?.presets?.[0]?.params)}
                                    color="#c0392b"
                                />
                                <DevButton
                                    label="LVL 2"
                                    onClick={() => controller.handleNav(StateId.GAME_2, game2?.presets?.[1]?.params)}
                                    color="#d35400"
                                />
                                <DevButton
                                    label="LVL 3"
                                    onClick={() => controller.handleNav(StateId.GAME_2, game2?.presets?.[2]?.params)}
                                    color="#f39c12"
                                />
                            </div>
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5cqw'}}>
                            <div style={{fontSize: '0.8cqw', color: '#00d2ff', marginBottom: '0.5cqw'}}>
                                MODULE: {bhGame?.displayName.toUpperCase() ?? "BH_GAME"}
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5cqw'}}>
                                <DevButton
                                    label="LVL 1"
                                    onClick={() => controller.handleNav(StateId.BH_GAME, bhGame?.presets?.[0]?.params)}
                                    color="#0984e3"
                                />
                                <DevButton
                                    label="LVL 2"
                                    onClick={() => controller.handleNav(StateId.BH_GAME, bhGame?.presets?.[1]?.params)}
                                    color="#6c5ce7"
                                />
                                <DevButton
                                    label="LVL 3"
                                    onClick={() => controller.handleNav(StateId.BH_GAME, bhGame?.presets?.[2]?.params)}
                                    color="#a29bfe"
                                />
                            </div>
                        </div>

                        <div style={{gridColumn: 'span 2', marginTop: '1cqw'}}>
                            <div style={{fontSize: '0.8cqw', color: '#888', marginBottom: '0.5cqw'}}>SYSTEM_NAVIGATION
                            </div>
                            <DevButton
                                label="OPEN SAVE / LOAD MENU"
                                onClick={() => controller.openPopup(StateId.SAVE_MENU)}
                                color="#d35400"
                            />
                        </div>
                    </div>
                </div>

                <div style={{
                    flex: 1, backgroundColor: '#111', padding: '1.5cqw',
                    borderRadius: '0.4cqw', borderLeft: '0.1cqw solid #333',
                    display: 'flex', flexDirection: 'column'
                }}>
                    <h3 style={{
                        fontSize: '1.2cqw',
                        margin: '0 0 2cqw 0',
                        borderBottom: '0.1cqw solid #333',
                        paddingBottom: '0.5cqw'
                    }}>
                        GLOBAL_CONFIG
                    </h3>

                    <AudioSlider label="MASTER_VOLUME" value={vols.master}
                                 onChange={(v) => handleVolChange('master', v)}/>
                    <AudioSlider label="OST_VOLUME" value={vols.ost} onChange={(v) => handleVolChange('ost', v)}/>
                    <AudioSlider label="SFX_VOLUME" value={vols.sfx} onChange={(v) => handleVolChange('sfx', v)}/>

                    <div style={{marginTop: '1cqw', marginBottom: '1.5cqw'}}>
                        <div style={{fontSize: '0.7cqw', color: '#888', marginBottom: '0.6cqw'}}>DISPLAY_RESOLUTION
                        </div>
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4cqw'}}>
                            {['540p', '720p', '1080p', '1440p', '4k', 'fit'].map(r => (
                                <DevButton key={r} label={r.toUpperCase()} active={res === r}
                                           onClick={() => controller.updateResolution(r, setRes)}/>
                            ))}
                        </div>
                    </div>

                    <div style={{marginBottom: '1.5cqw'}}>
                        <div style={{fontSize: '0.7cqw', color: '#888', marginBottom: '0.6cqw'}}>WINDOW_MODE</div>
                        <DevButton label="TOGGLE FULLSCREEN" onClick={toggleFullscreen} color="#b33939"/>
                    </div>

                    <div style={{marginTop: '0.5cqw'}}>
                        <DevButton
                            label="[ SETTINGS_PANEL ]"
                            subLabel="INPUTS & OVERRIDES"
                            onClick={() => controller.openPopup(StateId.SETTINGS_MENU, { res, setRes })}
                            color="#000"
                        />
                    </div>

                    <div style={{marginTop: 'auto', fontSize: '0.7cqw', color: '#444', lineHeight: '1.4'}}>
                        PERSISTENCE: ACTIVE<br/>
                        SETTINGS_SYNC: LOCAL_STORAGE<br/>
                        ACTIVE_RES: {res?.toUpperCase()}
                    </div>
                </div>
            </div>
        </div>
    );
};