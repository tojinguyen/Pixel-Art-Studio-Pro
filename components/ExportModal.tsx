import React, { useState, useCallback } from 'react';
import { GeneratedAsset, Settings, GenerationType } from '../types';
import { CloseIcon } from './icons';
import { upscaleImage, sliceSpriteSheet, createZip, triggerDownload } from '../services/exportService';

interface ExportModalProps {
  assets: GeneratedAsset[];
  settings: Settings;
  onClose: () => void;
}

type AnimationExportType = 'spritesheet' | 'frames';
type ParallaxExportType = 'layers';

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

export const ExportModal: React.FC<ExportModalProps> = ({ assets, settings, onClose }) => {
  const primaryAsset = assets[0];
  const isAnimation = primaryAsset.type === GenerationType.AnimationSheet;
  const isParallax = primaryAsset.type === GenerationType.ParallaxLayer;

  const [scale, setScale] = useState(1);
  const [filename, setFilename] = useState(`${primaryAsset.type.replace(/ /g, '_')}_${new Date().getTime()}`);
  const [animationExportType, setAnimationExportType] = useState<AnimationExportType>('spritesheet');
  const [parallaxExportType, setParallaxExportType] = useState<ParallaxExportType>('layers');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = useCallback(async () => {
    setIsProcessing(true);
    try {
        if (isAnimation) {
            if (animationExportType === 'spritesheet') {
                const upscaledData = await upscaleImage(primaryAsset.data, scale);
                triggerDownload(upscaledData, `${filename}.png`);
            } else if (animationExportType === 'frames') {
                const frames = await sliceSpriteSheet(primaryAsset.data, settings);
                const files = await Promise.all(frames.map(async (frameData, i) => {
                    const upscaledFrame = await upscaleImage(frameData, scale);
                    return {
                        name: `${filename}_frame_${i + 1}.png`,
                        data: upscaledFrame.split(',')[1],
                    };
                }));
                const zipBlob = await createZip(files);
                triggerDownload(zipBlob, `${filename}.zip`);
            }
        } else if (isParallax) {
             const files = await Promise.all(assets.map(async (asset, i) => {
                const upscaledLayer = await upscaleImage(asset.data, scale);
                return {
                    name: `${filename}_layer_${i + 1}.png`,
                    data: upscaledLayer.split(',')[1],
                };
            }));
            const zipBlob = await createZip(files);
            triggerDownload(zipBlob, `${filename}.zip`);
        } else {
            // Standard asset export
            const upscaledData = await upscaleImage(primaryAsset.data, scale);
            triggerDownload(upscaledData, `${filename}.png`);
        }
    } catch (error) {
        console.error("Export failed:", error);
        alert("An error occurred during export. Please check the console.");
    } finally {
        setIsProcessing(false);
        onClose();
    }
  }, [primaryAsset, assets, settings, scale, filename, animationExportType, isAnimation, isParallax, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-gray-800 border-4 border-gray-700 text-white p-4 relative">
        <button onClick={onClose} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-white">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-lg text-green-400 mb-4">EXPORT OPTIONS</h2>

        <Section title="File Settings">
            <div>
                <Label htmlFor="filename">Filename (.png or .zip)</Label>
                <Input id="filename" type="text" value={filename} onChange={(e) => setFilename(e.target.value)} />
            </div>
            <div>
                <Label htmlFor="scale">Scale: {scale}x</Label>
                <Input id="scale" type="range" min="1" max="16" step="1" value={scale} onChange={(e) => setScale(parseInt(e.target.value, 10))} />
            </div>
        </Section>
        
        {isAnimation && (
             <Section title="Animation Export">
                <Label htmlFor="anim-export-type">Export As</Label>
                <Select id="anim-export-type" value={animationExportType} onChange={e => setAnimationExportType(e.target.value as AnimationExportType)}>
                    <option value="spritesheet">Sprite Sheet (Single PNG)</option>
                    <option value="frames">Individual Frames (ZIP)</option>
                </Select>
            </Section>
        )}

        {isParallax && (
            <Section title="Parallax Export">
                <p className="text-xs text-gray-400">All layers will be exported into a single ZIP file.</p>
            </Section>
        )}

        <div className="mt-6 flex justify-end gap-2">
            <button onClick={onClose} className="p-2 text-center bg-gray-600 hover:bg-gray-500 uppercase text-xs tracking-widest">
                Cancel
            </button>
            <button onClick={handleExport} disabled={isProcessing} className="p-2 px-4 text-center bg-green-600 hover:bg-green-500 disabled:bg-gray-500 uppercase text-xs tracking-widest">
                {isProcessing ? 'PROCESSING...' : 'Export'}
            </button>
        </div>
      </div>
    </div>
  );
};