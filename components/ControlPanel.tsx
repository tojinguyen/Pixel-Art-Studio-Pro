import React from 'react';
import { Settings, GenerationType, AnimationType } from '../types';
import { PALETTES, STYLES } from '../constants';

interface ControlPanelProps {
  settings: Settings;
  onSettingsChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onGenerate: () => void;
  isLoading: boolean;
  canClear: boolean;
  onClearLayers: () => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-4">
    <h3 className="text-sm text-green-400 mb-2 uppercase tracking-widest">{title}</h3>
    <div className="p-3 bg-gray-900 border-2 border-gray-700 space-y-3">{children}</div>
  </div>
);

const Label: React.FC<{ htmlFor: string; children: React.ReactNode }> = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block text-xs text-gray-400 mb-1">{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={`w-full p-2 bg-gray-800 border-2 border-gray-600 focus:border-green-500 focus:outline-none ${props.className}`} />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} className={`w-full p-2 bg-gray-800 border-2 border-gray-600 focus:border-green-500 focus:outline-none appearance-none bg-no-repeat bg-right pr-8`} style={{backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`}}>
    {props.children}
  </select>
);


const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea {...props} className={`w-full p-2 bg-gray-800 border-2 border-gray-600 focus:border-green-500 focus:outline-none ${props.className}`} />
);

export const ControlPanel: React.FC<ControlPanelProps> = (props) => {
  const { settings, onSettingsChange, onGenerate, isLoading, canClear, onClearLayers } = props;

  const handleAnimationChange = <K extends keyof Settings['animation']>(key: K, value: Settings['animation'][K]) => {
    onSettingsChange('animation', { ...settings.animation, [key]: value });
  };
  
  const handlePixelSizeChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseInt(value, 10) || 0;
    onSettingsChange('pixelSize', { ...settings.pixelSize, [dimension]: numValue });
  }

  return (
    <div className="w-full md:w-96 bg-gray-800 p-4 border-l-4 border-gray-700 overflow-y-auto">
      <h2 className="text-lg text-green-400 mb-4">CONTROLS</h2>
      
      <Section title="AI Prompt">
        <Label htmlFor="prompt">Describe your asset</Label>
        <TextArea id="prompt" rows={4} value={settings.prompt} onChange={e => onSettingsChange('prompt', e.target.value)} />
      </section>

      <Section title="Asset Type">
        <Label htmlFor="generationType">Generation Type</Label>
        <Select id="generationType" value={settings.generationType} onChange={e => onSettingsChange('generationType', e.target.value as GenerationType)}>
          {Object.values(GenerationType).map(type => <option key={type} value={type}>{type}</option>)}
        </Select>
      </Section>

      <Section title="Visuals">
        <div className="flex space-x-2">
            <div>
              <Label htmlFor="pixelWidth">Width (px)</Label>
              <Input id="pixelWidth" type="number" min="8" step="8" value={settings.pixelSize.width} onChange={e => handlePixelSizeChange('width', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="pixelHeight">Height (px)</Label>
              <Input id="pixelHeight" type="number" min="8" step="8" value={settings.pixelSize.height} onChange={e => handlePixelSizeChange('height', e.target.value)} />
            </div>
        </div>
        <div>
          <Label htmlFor="style">Art Style</Label>
          <Select id="style" value={settings.style} onChange={e => onSettingsChange('style', e.target.value)}>
            {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        <div>
          <Label htmlFor="colorPalette">Color Palette</Label>
          <Select id="colorPalette" value={settings.colorPalette} onChange={e => onSettingsChange('colorPalette', e.target.value)}>
            {Object.keys(PALETTES).map(p => <option key={p} value={p}>{p}</option>)}
          </Select>
        </div>
        {settings.colorPalette === 'Custom' && (
          <div>
            <Label htmlFor="customPalette">Custom HEX Palette (comma-separated)</Label>
            <Input id="customPalette" type="text" value={settings.customPalette} onChange={e => onSettingsChange('customPalette', e.target.value)} />
          </div>
        )}
      </Section>

      {settings.generationType === GenerationType.AnimationSheet && (
        <Section title="Animation">
          <div>
            <Label htmlFor="animationType">Animation Type</Label>
            <Select id="animationType" value={settings.animation.animationType} onChange={e => handleAnimationChange('animationType', e.target.value as AnimationType)}>
              {Object.values(AnimationType).map(type => <option key={type} value={type}>{type}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="frameCount">Frames: {settings.animation.frameCount}</Label>
            <Input id="frameCount" type="range" min="1" max="12" value={settings.animation.frameCount} onChange={e => handleAnimationChange('frameCount', parseInt(e.target.value, 10))} />
          </div>
           <div>
            <Label htmlFor="fps">FPS: {settings.animation.fps}</Label>
            <Input id="fps" type="range" min="1" max="24" value={settings.animation.fps} onChange={e => handleAnimationChange('fps', parseInt(e.target.value, 10))} />
          </div>
        </Section>
      )}

      <div className="mt-6 space-y-2">
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full p-3 text-center bg-green-600 hover:bg-green-500 disabled:bg-gray-500 text-white uppercase tracking-widest transition-colors duration-200"
        >
          {isLoading ? 'GENERATING...' : 'GENERATE'}
        </button>
        { canClear &&
            <button
                onClick={onClearLayers}
                className="w-full p-2 text-center bg-red-600 hover:bg-red-500 text-white uppercase tracking-widest text-xs"
            >
                Clear Parallax Layers
            </button>
        }
      </div>

    </div>
  );
};