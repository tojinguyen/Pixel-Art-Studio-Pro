
import React from 'react';

interface PixelatedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

export const PixelatedImage: React.FC<PixelatedImageProps> = ({ src, alt, className, style }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        imageRendering: 'pixelated',
        ...style
      }}
    />
  );
};
