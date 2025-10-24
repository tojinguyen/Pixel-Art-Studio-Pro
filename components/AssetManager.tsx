import React from 'react';
import { GeneratedAsset } from '../types';
import { PixelatedImage } from './PixelatedImage';
import { TrashIcon, CopyIcon, ArrowUpIcon, ArrowDownIcon } from './icons';

interface AssetManagerProps {
    assets: GeneratedAsset[];
    selectedAssetId: string | null;
    onSelectAsset: (id: string) => void;
    onDeleteAsset: (id: string) => void;
    onDuplicateAsset: (id: string) => void;
    onReorderAsset: (index: number, direction: 'up' | 'down') => void;
}

export const AssetManager: React.FC<AssetManagerProps> = (props) => {
    const { assets, selectedAssetId, onSelectAsset, onDeleteAsset, onDuplicateAsset, onReorderAsset } = props;

    return (
        <div className="space-y-2 max-h-64 overflow-y-auto">
            {assets.map((asset, index) => (
                <div
                    key={asset.id}
                    onClick={() => onSelectAsset(asset.id)}
                    className={`flex items-center gap-2 p-2 cursor-pointer border-2 ${selectedAssetId === asset.id ? 'border-green-500 bg-gray-800' : 'border-gray-700 bg-gray-900 hover:bg-gray-800'}`}
                >
                    <div className="w-10 h-10 flex-shrink-0 bg-gray-700 flex items-center justify-center">
                        <PixelatedImage src={asset.data} alt="thumbnail" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-grow overflow-hidden">
                        <p className="text-xs text-white truncate">{asset.prompt}</p>
                        <p className="text-xs text-gray-400">{asset.type}</p>
                    </div>
                    <div className="flex items-center flex-shrink-0 text-gray-400">
                        <button onClick={(e) => { e.stopPropagation(); onReorderAsset(index, 'up'); }} disabled={index === 0} className="p-1 hover:text-white disabled:opacity-25"><ArrowUpIcon className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); onReorderAsset(index, 'down'); }} disabled={index === assets.length - 1} className="p-1 hover:text-white disabled:opacity-25"><ArrowDownIcon className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDuplicateAsset(asset.id); }} className="p-1 hover:text-white"><CopyIcon className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); onDeleteAsset(asset.id); }} className="p-1 hover:text-red-500"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                </div>
            ))}
        </div>
    );
};
