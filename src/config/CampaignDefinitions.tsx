// src/config/CampaignDefinitions.ts
import {CampaignRegistry} from "../core/registry/CampaignRegistry";
import {ICampaignStep} from "../core/interfaces/ICampaign";
import {StateRegistry} from "../core/registry/StateRegistry";

import {Game1State} from "../features/Game1/model/Game1State";
import {Game1Level} from "../features/Game1/model/Game1Config";
import {Game2State} from "../features/Game2/model/Game2State";
import {Game2Level} from "../features/Game2/model/Game2Config";

import {DemoLoadingView} from "../components/loading/DemoLoadingView";
import React from "react";
import {ContinueState} from "../features/shared-menus/states/ContinueState";
import {GameOverState} from "../features/shared-menus/states/GameOverState";

export const initializeGameRegistry = () => {
    StateRegistry.register("Game1", Game1State);
    StateRegistry.register("Game2", Game2State);
};

const LoreLoadingView = (props: { message: string, isFinished: boolean, onTransitionComplete: () => void }) => (
    <div style={{
        width: '100%',
        height: '100%',
        background: '#111',
        color: '#ccc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace'
    }}>
        <h1 style={{color: '#e74c3c'}}>MISSION BRIEFING</h1>
        <p style={{maxWidth: '60%', textAlign: 'center', lineHeight: '1.6'}}>{props.message}</p>

        {props.isFinished && (
            <button onClick={props.onTransitionComplete} style={{
                marginTop: '20px',
                padding: '10px 20px',
                background: '#e74c3c',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
            }}>
                DEPLOY
            </button>
        )}
    </div>
);
const StoryCampaign: ICampaignStep[] = [
    {
        name: "Prologue: The Awakening",
        factory: (cfg) => new Game1State(false, cfg),
        config: Game1Level.Level1,
        loadingConfig: {
            view: LoreLoadingView,
            props: {message: "System initializing. Hostiles detected in Sector 7. Engage immediately."}
        }
    },
    {
        name: "Chapter 1: The Descent",
        factory: (cfg) => new Game1State(false, cfg),
        config: Game1Level.Level2,
        loadingConfig: {
            view: LoreLoadingView,
            props: {message: "Surface cleared. Descending into the sub-levels. Energy signatures rising."}
        }
    },
    {
        name: "Intermission: Resupply",
        factory: (cfg) => new Game2State(false, cfg),
        config: Game2Level.Level1,
        loadingConfig: {
            view: DemoLoadingView, // Standard loader
            props: {message: "Returning to Base..."}
        }
    }
];

const ArcadeCampaign: ICampaignStep[] = [
    {
        name: "Stage 1",
        factory: (cfg) => new Game2State(false, cfg),
        config: Game2Level.Level1,
        loadingConfig: {props: {message: "Arcade Mode: Stage 1"}}
    },
    {
        name: "Stage 2",
        factory: (cfg) => new Game1State(false, cfg),
        config: Game1Level.Level3,
        loadingConfig: {props: {message: "Arcade Mode: Stage 2"}}
    }
];

export const initializeCampaigns = () => {
    CampaignRegistry.register({id: "story_mode", steps: StoryCampaign, failFactory: () => new ContinueState()});
    CampaignRegistry.register({id: "arcade_mode", steps: ArcadeCampaign, failFactory: () => new GameOverState()});
}