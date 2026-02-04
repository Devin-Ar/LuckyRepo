// src/features/shared-menus/view/DevMenuView.tsx

import React, {useState} from 'react';
import {Game1State} from '../Game1/model/Game1State';
import {Game1Level} from '../Game1/model/Game1Config';
import {Game2State} from '../Game2/model/Game2State';
import {Game2Level} from '../Game2/model/Game2Config';
import {BHState} from '../BulletTest/model/BHState';
import {BHLevel} from '../BulletTest/model/BHConfig';
import {StateManager} from '../../core/managers/StateManager';
import {AudioManager} from '../../core/managers/AudioManager';
import {SharedSession} from '../../core/session/SharedSession';
import {SaveMenuState} from '../shared-menus/states/SaveMenuState';
import {SettingsMenuState} from '../shared-menus/states/SettingsMenuState'; // Import the new state
import {DemoLoadingView} from '../../components/loading/DemoLoadingView';
import {CampaignManager} from "../../core/managers/CampaignManager";

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
    onNavigate: (StateClass: any, ...args: any[]) => void;
    res?: string;
    setRes?: (r: any) => void;
}

export const DevMenuView: React.FC<DevMenuViewProps> = ({onNavigate, res, setRes}) => {
    const session = SharedSession.getInstance();
    const audio = AudioManager.getInstance();

    const [vols, setVols] = useState({
        master: session.get<number>('master_volume') ?? 0.5,
        ost: session.get<number>('ost_volume') ?? 0.5,
        sfx: session.get<number>('sfx_volume') ?? 0.5
    });

    const openSaveMenu = () => {
        StateManager.getInstance().push(new SaveMenuState());
    };

    const openSettingsMenu = () => {
        StateManager.getInstance().push(new SettingsMenuState({ res, setRes }));
    };

    const handleVolChange = (cat: 'master' | 'ost' | 'sfx', val: number) => {
        audio.setVolume(cat, val);
        session.set(`${cat}_volume`, val);
        setVols(prev => ({...prev, [cat]: val}));
    };

    const handleResChange = (r: string) => {
        setRes?.(r);
        session.set('resolution', r);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const handleNav = (StateClass: any, level: any) => {
        session.clearSavableKeys();
        session.set('campaign_id', null);
        session.set('campaign_step_index', 0);

        const target = new StateClass(false, level);
        const loadingConfig = StateClass === Game1State ? {view: DemoLoadingView} : {};
        StateManager.getInstance().replace(target, loadingConfig);
    };

    const startCampaign = (id: string) => {
        CampaignManager.getInstance().startCampaign(id);
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
                                        onClick={() => startCampaign('story_mode')}
                                        color="#e74c3c"
                                    />
                                </div>
                                <div style={{flex:1}}>
                                    <DevButton
                                        label="ARCADE MODE"
                                        subLabel="Quick Action"
                                        onClick={() => startCampaign('arcade_mode')}
                                        color="#f39c12"
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5cqw'}}>
                            <div style={{fontSize: '0.8cqw', color: '#888', marginBottom: '0.5cqw'}}>MODULE: GAME_01</div>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5cqw'}}>
                                <DevButton label="LVL 1" onClick={() => handleNav(Game1State, Game1Level.Level1)}
                                           color="#27ae60"/>
                                <DevButton label="LVL 2" onClick={() => handleNav(Game1State, Game1Level.Level2)}
                                           color="#2980b9"/>
                                <DevButton label="LVL 3" onClick={() => handleNav(Game1State, Game1Level.Level3)}
                                           color="#8e44ad"/>
                            </div>
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5cqw'}}>
                            <div style={{fontSize: '0.8cqw', color: '#888', marginBottom: '0.5cqw'}}>MODULE: GAME_02</div>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5cqw'}}>
                                <DevButton label="LVL 1" onClick={() => handleNav(Game2State, Game2Level.Level1)}
                                           color="#c0392b"/>
                                <DevButton label="LVL 2" onClick={() => handleNav(Game2State, Game2Level.Level2)}
                                           color="#d35400"/>
                                <DevButton label="LVL 3" onClick={() => handleNav(Game2State, Game2Level.Level3)}
                                           color="#f39c12"/>
                            </div>
                        </div>

                        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5cqw'}}>
                            <div style={{fontSize: '0.8cqw', color: '#888', marginBottom: '0.5cqw'}}>MODULE: Bullet Hell
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5cqw'}}>
                                <DevButton label="LVL 1" onClick={() => handleNav(BHState, BHLevel.Level1)}
                                           color="#8e44ad"/>
                                <DevButton label="LVL 2" onClick={() => handleNav(BHState, BHLevel.Level2)}
                                           color="#2980b9"/>
                                <DevButton label="LVL 3" onClick={() => handleNav(BHState, BHLevel.Level3)}
                                           color="#27ae60"/>
                            </div>
                        </div>

                        <div style={{gridColumn: 'span 2', marginTop: '1cqw'}}>
                            <div style={{fontSize: '0.8cqw', color: '#888', marginBottom: '0.5cqw'}}>SYSTEM_NAVIGATION
                            </div>
                            <DevButton label="OPEN SAVE / LOAD MENU" onClick={openSaveMenu} color="#d35400"/>
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
                                           onClick={() => handleResChange(r)}/>
                            ))}
                        </div>
                    </div>

                    <div style={{marginBottom: '1.5cqw'}}>
                        <div style={{fontSize: '0.7cqw', color: '#888', marginBottom: '0.6cqw'}}>WINDOW_MODE</div>
                        <DevButton label="TOGGLE FULLSCREEN" onClick={toggleFullscreen} color="#b33939"/>
                    </div>

                    {/* QUICK ACCESS IN SIDE PANEL */}
                    <div style={{marginTop: '0.5cqw'}}>
                        <DevButton
                            label="[ SETTINGS_PANEL ]"
                            subLabel="INPUTS & OVERRIDES"
                            onClick={openSettingsMenu}
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