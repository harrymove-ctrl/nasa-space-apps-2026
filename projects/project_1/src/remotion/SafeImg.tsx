import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { continueRender, delayRender } from 'remotion';

export interface SafeImgProps {
  readonly src: string;
  readonly alt: string;
  readonly style?: CSSProperties;
}

/**
 * Remotion asset image wrapper guarded by delayRender/continueRender so
 * progressive JPEGs and PNGs never hang OffthreadVideo/decode() or render blank frames.
 */
export function SafeImg({ src, alt, style }: SafeImgProps) {
  const [handle] = useState(() => delayRender(`SafeImg:${src}`));
  const settledRef = useRef(false);

  const settle = useCallback(() => {
    if (!settledRef.current) {
      settledRef.current = true;
      continueRender(handle);
    }
  }, [handle]);

  useEffect(() => {
    return () => {
      if (!settledRef.current) {
        settledRef.current = true;
        continueRender(handle);
      }
    };
  }, [handle]);

  return (
    <img
      src={src}
      alt={alt}
      decoding="sync"
      onLoad={settle}
      onError={settle}
      style={{
        maxWidth: 'none',
        ...style,
      }}
    />
  );
}
