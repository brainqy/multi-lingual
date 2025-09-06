
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState } from 'react';
import type { PlatformSettings } from '@/types';

interface SettingsContextType {
  settings: PlatformSettings;
  setSettings: React.Dispatch<React.SetStateAction<PlatformSettings>>;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
  settings: PlatformSettings;
}

export function SettingsProvider({ children, settings: initialSettings }: SettingsProviderProps) {
  const [settings, setSettings] = useState<PlatformSettings>(initialSettings);
  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
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
