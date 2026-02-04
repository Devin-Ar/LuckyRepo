// src/core/interfaces/IBuffer.ts
export interface IBuffer {
    BUFFER_SIZE: number;

    [key: string]: number;
}

export type BufferMap = Record<string, IBuffer>;