import React, { useState, useCallback, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { Artboard } from './components/Artboard';
import { Settings, GeneratedAsset, GenerationType } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { generatePixelArt } from './services/geminiService';
import { saveState, loadState } from './services/storageService';

const loadedState = loadState();

function App() {
  const [settings, setSettings] = useState<Settings>(loadedState?.settings || DEFAULT_SETTINGS);
  const [assets, setAssets] = useState<GeneratedAsset[]>(loadedState?.assets || []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    saveState({ settings, assets });
  }, [settings, assets]);

  const handleSettingsChange = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const imageData = await generatePixelArt(settings);
      const newAsset: GeneratedAsset = {
        id: new Date().toISOString(),
        type: settings.generationType,
        data: `data:image/png;base64,${imageData}`,
        prompt: settings.prompt,
      };

      if (settings.generationType === GenerationType.ParallaxLayer) {
        setAssets(prev => [...prev, newAsset]);
      } else {
        setAssets([newAsset]);
      }

    } catch (e: any) {
      setError(e.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [settings]);
  
  const handleClearLayers = useCallback(() => {
      setAssets([]);
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-gray-200">
      <header className="absolute top-0 left-0 p-4 z-10">
        <h1 className="text-lg text-white">Pixel Art Studio <span className="text-green-400">Pro+</span></h1>
      </header>
      
      <main className="flex flex-1 pt-16 md:pt-0">
        <Artboard
          settings={settings}
          assets={assets}
          isLoading={isLoading}
          error={error}
        />
        <ControlPanel
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onGenerate={handleGenerate}
          isLoading={isLoading}
          canClear={settings.generationType === GenerationType.ParallaxLayer && assets.length > 0}
          onClearLayers={handleClearLayers}
        />
      </main>
    </div>
  );
}

export default App;