'use client';

import { useEffect } from 'react';
import { initTheme } from '@/stores/use-app-store';

export function InitThemeClient() {
  useEffect(() => {
    initTheme();
  }, []);

  return null;
}
