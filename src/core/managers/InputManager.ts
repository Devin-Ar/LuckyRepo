// src/core/managers/InputManager.ts

export interface InputSnapshot {
    isHoveringButton: boolean;
    isMouseDown: boolean;
    keys: Set<string>;
}

export class InputManager {
    private static instance: InputManager;

    private isHoveringButton: boolean = false;
    private isMouseDown: boolean = false;
    private activeKeys: Set<string> = new Set();

    private constructor() {
        this.setupGlobalListeners();
    }

    public static getInstance(): InputManager {
        if (!InputManager.instance) InputManager.instance = new InputManager();
        return InputManager.instance;
    }

    public getSnapshot(): InputSnapshot {
        return {
            isHoveringButton: this.isHoveringButton,
            isMouseDown: this.isMouseDown,
            keys: new Set(this.activeKeys)
        };
    }

    public isKeyDown(key: string): boolean {
        return this.activeKeys.has(key.toUpperCase());
    }

    public reset() {
        this.activeKeys.clear();
        this.isMouseDown = false;
        this.isHoveringButton = false;
    }

    private setupGlobalListeners() {
        window.addEventListener('keydown', (e) => {
            this.activeKeys.add(e.key.toUpperCase());
        });

        window.addEventListener('keyup', (e) => {
            this.activeKeys.delete(e.key.toUpperCase());
        });

        window.addEventListener('mousedown', () => {
            this.isMouseDown = true;
        });
        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });

        window.addEventListener('mouseover', (e) => {
            const target = e.target as HTMLElement;
            this.isHoveringButton = !!target.closest('button, .interactable');
        });

        window.addEventListener('blur', () => {
            this.reset();
        });
    }
}