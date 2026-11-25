import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackIcon?: string;
  fallbackText?: string;
  fallbackClassName?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackIcon = 'spa',
  fallbackText,
  fallbackClassName = '',
  ...rest
}) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-surface-container text-primary select-none ${fallbackClassName || className}`}
      >
        {fallbackText ? (
          <span className="font-label-sm text-label-sm font-bold">{fallbackText}</span>
        ) : (
          <span className="material-symbols-outlined text-[18px]">{fallbackIcon}</span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  );
};
