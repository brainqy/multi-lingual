
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext } from 'react';
import type { PlatformSettings } from '@/types';

interface SettingsContextType {
  settings: PlatformSettings;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
  settings: PlatformSettings;
}

export function SettingsProvider({ children, settings }: SettingsProviderProps) {
  return (
    <SettingsContext.Provider value={{ settings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
