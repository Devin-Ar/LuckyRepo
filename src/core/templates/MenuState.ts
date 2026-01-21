// src/core/templates/MenuState.ts
import {JSX} from 'react';
import {State} from './State';
import {StateManager} from '../managers/StateManager';


export abstract class MenuState extends State {
    constructor() {
        super();
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    public async init(): Promise<void> {
        this.isRendering = true;
        window.addEventListener('keydown', this.handleKeyDown, true);
    }

    public abstract getView(): JSX.Element;

    public destroy(): void {
        window.removeEventListener('keydown', this.handleKeyDown, true);
    }

    protected onClose(): void {
        StateManager.getInstance().pop();
    }

    private handleKeyDown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            e.stopImmediatePropagation();
            e.preventDefault();
            this.onClose();
        }
    }
}