// src/core/managers/InputManager.ts
import { SharedSession } from '../session/SharedSession';
import { INPUT_REGISTRY } from '../registry/InputRegistry';

export interface InputSnapshot {
    isHoveringButton: boolean;
    isMouseDown: boolean;
    mouseX: number;
    mouseY: number;
    actions: string[];
}

export class InputManager {
    private static instance: InputManager;
    private mouseX: number = 0;
    private mouseY: number = 0;
    private isHoveringButton: boolean = false;
    private isMouseDown: boolean = false;
    private activeKeys: Set<string> = new Set();

    private currentBindings: Map<string, string[]> = new Map();
    private currentGame: string = "Shared";

    private constructor() {
        this.setupGlobalListeners();
        this.refreshBindings("Shared");
    }

    public static getInstance(): InputManager {
        if (!InputManager.instance) InputManager.instance = new InputManager();
        return InputManager.instance;
    }

    public getSnapshot(): InputSnapshot {
        const activeActions: string[] = [];
        this.currentBindings.forEach((keys, action) => {
            if (keys.some(key => this.activeKeys.has(key))) {
                activeActions.push(action);
            }
        });

        return {
            isHoveringButton: this.isHoveringButton,
            isMouseDown: this.isMouseDown,
            mouseX: this.mouseX,
            mouseY: this.mouseY,
            actions: activeActions
        };
    }

    public reset() {
        this.activeKeys.clear();
        this.isMouseDown = false;
        this.isHoveringButton = false;
    }

    public refreshBindings(gameName: string) {
        this.currentGame = gameName;
        const session = SharedSession.getInstance();

        const merged: Record<string, string[]> = {
            ...INPUT_REGISTRY["Shared"],
            ...(INPUT_REGISTRY[gameName] || {})
        };

        const sharedOverrides = session.get<Record<string, string[]>>(`bind_Shared`);
        if (sharedOverrides) {
            Object.assign(merged, sharedOverrides);
        }

        if (gameName !== "Shared") {
            const gameOverrides = session.get<Record<string, string[]>>(`bind_${gameName}`);
            if (gameOverrides) {
                Object.assign(merged, gameOverrides);
            }
        }

        this.currentBindings = new Map(Object.entries(merged));
    }

    public isKeyAction(pressedKey: string, actionName: string): boolean {
        const boundKeys = this.currentBindings.get(actionName);
        return boundKeys ? boundKeys.includes(pressedKey.toUpperCase()) : false;
    }

    public setBinding(action: string, key: string, gameName: string = this.currentGame, slotIndex: number = 0) {
        const session = SharedSession.getInstance();
        const storageKey = `bind_${gameName}`;

        const overrides = session.get<Record<string, string[]>>(storageKey) || {};

        if (!overrides[action]) {
            const currentKeys = this.currentBindings.get(action) || [];
            overrides[action] = [...currentKeys];
        }

        overrides[action][slotIndex] = key.toUpperCase();
        session.set(storageKey, overrides);
        this.refreshBindings(this.currentGame);
    }

    public resetBindings(gameName: string = this.currentGame) {
        const session = SharedSession.getInstance();
        const storageKey = `bind_${gameName}`;

        session.set(storageKey, undefined);

        this.refreshBindings(this.currentGame);
    }

    private setupGlobalListeners() {
        window.addEventListener('keydown', (e) => this.activeKeys.add(e.key.toUpperCase()));
        window.addEventListener('keyup', (e) => this.activeKeys.delete(e.key.toUpperCase()));
        window.addEventListener('mousemove', (e) => {
            const ww = window.innerWidth;
            const wh = window.innerHeight;
            const targetAspect = 16 / 9;
            const windowAspect = ww / wh;

            let gameW, gameH;
            let offsetX = 0;
            let offsetY = 0;

            if (windowAspect > targetAspect) {
                gameH = wh;
                gameW = wh * targetAspect;
                offsetX = (ww - gameW) / 2;
            } else {
                gameW = ww;
                gameH = ww / targetAspect;
                offsetY = (wh - gameH) / 2;
            }
            const relativeX = (e.clientX - offsetX) / gameW;
            const relativeY = (e.clientY - offsetY) / gameH;

            this.mouseX = Math.max(0, Math.min(1, relativeX));
            this.mouseY = Math.max(0, Math.min(1, relativeY));
        });
        window.addEventListener('mousedown', () => this.isMouseDown = true);
        window.addEventListener('mouseup', () => this.isMouseDown = false);
        window.addEventListener('mouseover', (e) => {
            const target = e.target as HTMLElement;
            this.isHoveringButton = !!target.closest('button, .interactable');
        });
        window.addEventListener('blur', () => this.reset());
    }
}