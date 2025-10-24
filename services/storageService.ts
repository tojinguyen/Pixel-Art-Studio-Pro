import { Settings, GeneratedAsset } from '../types';

const STORAGE_KEY = 'pixelArtStudioState';

interface AppState {
  settings: Settings;
  assets: GeneratedAsset[];
}

/**
 * Saves the application state to localStorage.
 * @param state - The current settings and assets.
 */
export function saveState(state: AppState): void {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (error) {
    console.warn("Could not save state to localStorage:", error);
  }
}

/**
 * Loads the application state from localStorage.
 * @returns The saved state or null if it doesn't exist or is invalid.
 */
export function loadState(): AppState | null {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return null;
    }
    const parsedState = JSON.parse(serializedState);
    // Basic validation to ensure the loaded data has the expected shape
    if (parsedState && typeof parsedState.settings === 'object' && Array.isArray(parsedState.assets)) {
        const { settings, assets } = parsedState;
        return { settings, assets };
    }
    return null;
  } catch (error) {
    console.warn("Could not load state from localStorage:", error);
    return null;
  }
}