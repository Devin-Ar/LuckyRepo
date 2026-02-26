// src/App.tsx
import {cloneElement, JSX, useEffect, useMemo, useRef, useState} from "react";
import {StateManager} from "./core/managers/StateManager";
import {DebugOverlay} from "./components/DebugOverlay";
import { initializeStateRegistry } from "./config/StateManifest";
import { initializeCampaigns } from "./config/CampaignManifest";
import {CampaignManager} from "./core/managers/CampaignManager";

type Resolution = '540p' | '720p' | '1080p' | '1440p' | '4k' | 'fit';

const App = () => {
    const [views, setViews] = useState<JSX.Element[]>([]);
    const [showDebug, setShowDebug] = useState(false);
    const [res, setRes] = useState<Resolution>('fit');
    const [uiScale, setUiScale] = useState(1.0);
    const [dpr, setDpr] = useState(window.devicePixelRatio || 1);

    const isInitialized = useRef(false);

    useEffect(() => {
        const manager = StateManager.getInstance();
        const handleUpdate = (activeViews: JSX.Element[]) => setViews([...activeViews]);

        const updateDpr = () => setDpr(window.devicePixelRatio || 1);
        const dprMedia = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
        dprMedia.addEventListener('change', updateDpr);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'F3') {
                e.preventDefault();
                setShowDebug(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);

        const unsubscribe = manager.subscribe(handleUpdate);

        if (!isInitialized.current) {
            initializeStateRegistry();

            initializeCampaigns();

            CampaignManager.getInstance().startCampaign('main_menu');

            isInitialized.current = true;
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            dprMedia.removeEventListener('change', updateDpr);
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }
        link.href = 'res/sprite/icon/icon.png';
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
    };

    const dims = useMemo(() => {
        switch (res) {
            case '540p': return {w: 960, h: 540};
            case '720p': return {w: 1280, h: 720};
            case '1080p': return {w: 1920, h: 1080};
            case '1440p': return {w: 2560, h: 1440};
            case '4k': return {w: 3840, h: 2160};
            default: return null;
        }
    }, [res]);

    return (
        <div className="engine-wrapper" style={{
            width: '100vw', height: '100vh', backgroundColor: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto'
        }}>
            <div className="engine-root" style={{
                width: dims ? `${dims.w / dpr}px` : '100%',
                height: dims ? `${dims.h / dpr}px` : 'auto',
                maxWidth: res === 'fit' ? '100vw' : 'none',
                maxHeight: res === 'fit' ? '100vh' : 'none',
                aspectRatio: '16 / 9',
                position: 'relative',
                backgroundColor: '#111',
                imageRendering: 'pixelated',
                containerType: 'size',
                flexShrink: 0,
                margin: 'auto'
            }}>
                {views.map((view, index) => (
                    <div key={index} style={{
                        position: 'absolute', inset: 0, zIndex: index,
                        pointerEvents: index === views.length - 1 ? 'auto' : 'none'
                    }}>
                        {cloneElement(view, {
                            width: dims?.w || 960,
                            height: dims?.h || 540,
                            res: res,
                            setRes: setRes,
                            uiScale: uiScale,
                            setUiScale: setUiScale
                        })}
                    </div>
                ))}
                {showDebug && <DebugOverlay/>}
            </div>
        </div>
    );
};

export default App;