import React, { useState, useEffect, useRef } from 'react';
import { Settings, GeneratedAsset, GenerationType } from '../types';
import { LoadingBar } from './LoadingBar';
import { PixelatedImage } from './PixelatedImage';
import { PlayIcon, PauseIcon, SkipNextIcon, SkipPreviousIcon, LoopIcon, DownloadIcon } from './icons';
import { ExportModal } from './ExportModal';

interface ArtboardProps {
  settings: Settings;
  assets: GeneratedAsset[];
  isLoading: boolean;
  error: string | null;
}

const CheckerboardBG: React.FC = () => (
    <div className="absolute inset-0 -z-10" style={{
        backgroundImage: 'repeating-conic-gradient(#374151 0% 25%, #4b5563 0% 50%)',
        backgroundSize: '20px 20px'
    }}/>
);

const AnimationPlayer: React.FC<{ asset: GeneratedAsset; settings: Settings }> = ({ asset, settings }) => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isLooping, setIsLooping] = useState(settings.animation.loop);
    const frameCount = settings.animation.frameCount;
    const fps = settings.animation.fps;

    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            setCurrentFrame(prevFrame => {
                const nextFrame = prevFrame + 1;
                if (nextFrame >= frameCount) {
                    return isLooping ? 0 : prevFrame;
                }
                return nextFrame;
            });
        }, 1000 / fps);
        return () => clearInterval(interval);
    }, [isPlaying, fps, frameCount, isLooping]);
    
    const spriteWidth = settings.pixelSize.width * frameCount;

    const zoom = Math.min(
        512 / settings.pixelSize.width, 
        512 / settings.pixelSize.height
    );

    return (
        <div className="flex flex-col items-center gap-4">
            <div 
                className="relative overflow-hidden border-2 border-gray-600"
                style={{ 
                    width: settings.pixelSize.width * zoom, 
                    height: settings.pixelSize.height * zoom,
                }}
            >
                <CheckerboardBG />
                <div
                    className="absolute top-0 left-0"
                    style={{
                        width: spriteWidth * zoom,
                        height: settings.pixelSize.height * zoom,
                        backgroundImage: `url(${asset.data})`,
                        backgroundSize: 'cover',
                        imageRendering: 'pixelated',
                        transform: `translateX(-${currentFrame * (settings.pixelSize.width * zoom)}px)`,
                        transition: 'transform 0s linear',
                    }}
                />
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-800 border-2 border-gray-700">
                <button onClick={() => setCurrentFrame(p => Math.max(0, p - 1))} className="p-2 hover:bg-gray-700"><SkipPreviousIcon className="w-6 h-6"/></button>
                <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 hover:bg-gray-700">
                    {isPlaying ? <PauseIcon className="w-6 h-6"/> : <PlayIcon className="w-6 h-6"/>}
                </button>
                <button onClick={() => setCurrentFrame(p => Math.min(frameCount - 1, p + 1))} className="p-2 hover:bg-gray-700"><SkipNextIcon className="w-6 h-6"/></button>
                <button onClick={() => setIsLooping(!isLooping)} className={`p-2 hover:bg-gray-700 ${isLooping ? 'text-green-400' : 'text-gray-400'}`}><LoopIcon className="w-6 h-6"/></button>
                 <span className="text-xs w-16 text-center">F: {currentFrame+1}/{frameCount}</span>
            </div>
        </div>
    );
};

const ParallaxPreview: React.FC<{ assets: GeneratedAsset[] }> = ({ assets }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePos({ x, y });
    };

    return (
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setMousePos({ x: 0.5, y: 0.5 })}
            className="relative w-full h-full max-w-xl max-h-xl aspect-square overflow-hidden border-2 border-gray-600"
        >
             <CheckerboardBG />
            {assets.map((asset, index) => {
                const depth = (index + 1) / assets.length;
                const moveX = (mousePos.x - 0.5) * 40 * depth;
                const moveY = (mousePos.y - 0.5) * 20 * depth;
                return (
                    <PixelatedImage
                        key={asset.id}
                        src={asset.data}
                        alt={`Parallax layer ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-contain transition-transform duration-300 ease-out"
                        style={{ transform: `translate(${moveX}px, ${moveY}px) scale(1.1)` }}
                    />
                );
            })}
        </div>
    );
};

export const Artboard: React.FC<ArtboardProps> = ({ settings, assets, isLoading, error }) => {
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    
    const latestAsset = assets.length > 0 ? assets[assets.length - 1] : null;
    const assetsToExport = settings.generationType === GenerationType.ParallaxLayer ? assets : (latestAsset ? [latestAsset] : []);

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center"><LoadingBar /><p className="mt-4 text-green-400">AI is summoning pixels...</p></div>;
        }
        if (error) {
            return <div className="text-center p-4 bg-red-900 border-2 border-red-500"><p className="text-red-300 text-xs">ERROR</p><p>{error}</p></div>;
        }
        if (assets.length === 0) {
            return <div className="text-center text-gray-500">
                <p>ARTBOARD</p>
                <p className="text-xs mt-2">Generated assets will appear here.</p>
            </div>;
        }
        
        const isParallax = settings.generationType === GenerationType.ParallaxLayer;
        if (isParallax) {
             return <ParallaxPreview assets={assets} />;
        }
        
        if (latestAsset) {
             if (latestAsset.type === GenerationType.AnimationSheet && settings.generationType === GenerationType.AnimationSheet) {
                return <AnimationPlayer asset={latestAsset} settings={settings} />;
            }
            return <PixelatedImage src={latestAsset.data} alt={latestAsset.prompt} className="max-w-full max-h-full object-contain" style={{maxHeight: '80vh'}} />;
        }

        return null;
    };
    
    const showExportButton = !isLoading && !error && assets.length > 0;

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative bg-black bg-opacity-20">
            {isExportModalOpen && assetsToExport.length > 0 && (
                <ExportModal 
                    assets={assetsToExport}
                    settings={settings}
                    onClose={() => setIsExportModalOpen(false)} 
                />
            )}

            <div className="absolute inset-0 bg-gray-800 -z-20"/>
            <div className="absolute inset-0 opacity-50" style={{backgroundImage: 'radial-gradient(#4a4a4a 1px, transparent 1px)', backgroundSize: '1rem 1rem'}}/>
            
            <div className="relative w-full h-full flex items-center justify-center">
                {!(isLoading || error || assets.length === 0 || (settings.generationType === GenerationType.ParallaxLayer && assets.length > 0)) && <CheckerboardBG/>}
                {renderContent()}
            </div>
            
            {showExportButton &&
                <div className="absolute bottom-4 right-4 flex gap-2">
                    <button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 p-2 bg-green-600 hover:bg-green-500 border-2 border-green-800">
                        <DownloadIcon className="w-5 h-5" />
                        <span className="text-xs">EXPORT</span>
                    </button>
                </div>
            }
        </div>
    );
};