import { useEffect, useState } from 'react';
import type { ColorMode, ColorModeClass } from '@xyflow/system';

function getMediaQuery() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return null;
  }

  return window.matchMedia('(prefers-color-scheme: dark)');
}

export default function useColorModeClass(colorMode: ColorMode): ColorModeClass {
  const [colorModeClass, setColorModeClass] = useState<ColorModeClass | null>(
    colorMode === 'system' ? null : colorMode
  );

  useEffect(() => {
    if (colorMode !== 'system') {
      setColorModeClass(colorMode);
      return;
    }

    const mediaQuery = getMediaQuery();
    const updateColorModeClass = () => setColorModeClass(mediaQuery?.matches ? 'dark' : 'light');

    updateColorModeClass();
    mediaQuery?.addEventListener('change', updateColorModeClass);

    return () => {
      mediaQuery?.removeEventListener('change', updateColorModeClass);
    };
  }, [colorMode]);

  return colorModeClass !== null ? colorModeClass : getMediaQuery()?.matches ? 'dark' : 'light';
}
