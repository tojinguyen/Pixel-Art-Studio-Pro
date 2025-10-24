import { Settings } from '../types';
// @ts-ignore
import JSZip from 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm';

interface FileForZip {
  name: string;
  data: string; // Base64 data, without the 'data:image/png;base64,' prefix
}

function loadImage(base64Data: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = base64Data;
  });
}

/**
 * Upscales a base64 image data string.
 * @param base64Data The original image data URL.
 * @param scale The factor to scale the image by (e.g., 2 for 2x).
 * @returns A promise that resolves with the new upscaled base64 data URL.
 */
export async function upscaleImage(base64Data: string, scale: number): Promise<string> {
  if (scale === 1) return base64Data;
  
  const img = await loadImage(base64Data);
  const canvas = document.createElement('canvas');
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  return canvas.toDataURL('image/png');
}

/**
 * Slices a sprite sheet into individual frames.
 * @param base64Data The sprite sheet data URL.
 * @param settings The generation settings containing dimensions and frame count.
 * @returns A promise that resolves with an array of base64 data URLs for each frame.
 */
export async function sliceSpriteSheet(base64Data: string, settings: Settings): Promise<string[]> {
    const img = await loadImage(base64Data);
    const { frameCount } = settings.animation;
    const { width: frameWidth, height: frameHeight } = settings.pixelSize;
    
    const frames: string[] = [];
    const canvas = document.createElement('canvas');
    canvas.width = frameWidth;
    canvas.height = frameHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    for (let i = 0; i < frameCount; i++) {
        ctx.clearRect(0, 0, frameWidth, frameHeight);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(
            img,
            i * frameWidth, // source x
            0,             // source y
            frameWidth,    // source width
            frameHeight,   // source height
            0,             // dest x
            0,             // dest y
            frameWidth,    // dest width
            frameHeight    // dest height
        );
        frames.push(canvas.toDataURL('image/png'));
    }

    return frames;
}

/**
 * Creates a ZIP file from a list of files.
 * @param files An array of objects with name and base64 data.
 * @returns A promise that resolves with the ZIP file as a Blob.
 */
export async function createZip(files: FileForZip[]): Promise<Blob> {
    const zip = new JSZip();
    files.forEach(file => {
        zip.file(file.name, file.data, { base64: true });
    });
    return zip.generateAsync({ type: 'blob' });
}


/**
 * Triggers a download in the browser for a data URL or a Blob.
 * @param urlOrBlob The data URL string or Blob object to download.
 * @param filename The desired name for the downloaded file.
 */
export function triggerDownload(urlOrBlob: string | Blob, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  
  if (typeof urlOrBlob === 'string') {
    link.href = urlOrBlob;
  } else {
    link.href = URL.createObjectURL(urlOrBlob);
  }
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  if (typeof urlOrBlob !== 'string') {
    URL.revokeObjectURL(link.href);
  }
}