// src/core/templates/BaseDispatcher.ts
import {IDispatcher} from '../interfaces/IDispatcher';
import {ICommand} from '../interfaces/ICommand';

export class BaseDispatcher<T> implements IDispatcher {

    constructor(
        private logic: T,
        private commands: Record<string, ICommand>,
        private debugName: string = "Dispatcher"
    ) {
    }

    public dispatch(action: string, payload: any): void {
        const command = this.commands[action];
        if (command) {
            command.execute(this.logic, payload);
        } else {
            console.warn(`[${this.debugName}] Unknown action: ${action}`);
        }
    }
}