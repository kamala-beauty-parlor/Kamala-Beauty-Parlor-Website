import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { normalizeImageUrl, getAlternativeImgurUrl } from '../lib/imageUrl';

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
  const normalizedSrc = normalizeImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState<string>(normalizedSrc);
  const [triedAlternative, setTriedAlternative] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const updated = normalizeImageUrl(src);
    setCurrentSrc(updated);
    setTriedAlternative(false);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    // If it's an Imgur URL and we haven't tried alternate extension (e.g. .png instead of .jpg)
    if (!triedAlternative && currentSrc) {
      const altUrl = getAlternativeImgurUrl(currentSrc);
      if (altUrl && altUrl !== currentSrc) {
        setTriedAlternative(true);
        setCurrentSrc(altUrl);
        return;
      }
    }

    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      return;
    }

    setHasError(true);
  };

  if (!currentSrc || hasError) {
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
      src={currentSrc}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      onError={handleError}
      className={className}
      {...props}
    />
  );
};

export default ImageWithFallback;
