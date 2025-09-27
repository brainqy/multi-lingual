import type { ReactNode } from 'react';

// This is a blank layout that allows its child pages to take up the full screen.
export default function FullscreenLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
