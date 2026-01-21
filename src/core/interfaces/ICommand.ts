// src/core/interfaces/ICommand.ts
export interface ICommand {
    execute(logic: any, payload: any): void;
}