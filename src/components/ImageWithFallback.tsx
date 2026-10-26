import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  category?: string;
}

export const ImageWithFallback: React.FC<Props> = ({
  src,
  alt = 'Kamala Beauty Parlor',
  fallbackSrc,
  className = '',
  category,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-pink-50 via-pink-100/40 to-white flex flex-col items-center justify-center p-4 text-center text-pink-700 border border-pink-100 ${className}`}
      >
        <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center mb-2 border border-pink-200">
          <Sparkles className="w-6 h-6 text-pink-500" />
        </div>
        <span className="font-serif text-sm font-bold tracking-wide text-pink-950">
          {alt || 'Kamala Beauty'}
        </span>
        {category && (
          <span className="text-[11px] font-sans text-pink-600 mt-0.5 tracking-wider uppercase font-semibold">
            {category}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
      {...props}
    />
  );
};
