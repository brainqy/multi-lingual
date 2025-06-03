
import type React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout can be used for admin-specific headers, footers, or side navigation
  // if needed in the future, or to apply specific styling/context to all admin pages.
  return <>{children}</>;
}
