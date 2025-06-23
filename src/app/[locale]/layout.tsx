// This file is simplified to resolve an i18n routing conflict.
// The app uses a context-based provider for internationalization.
import type { ReactNode } from 'react';

export default function LocaleLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
