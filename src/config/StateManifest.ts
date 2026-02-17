// src/config/StateManifest.ts
import { StateRegistry } from "../core/registry/StateRegistry";
import { UIFeatures } from "../features";

export const initializeStateRegistry = () => {
    UIFeatures.forEach(def => StateRegistry.register(def));
};