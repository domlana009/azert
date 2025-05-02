
import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Basic layout, can be expanded with admin sidebar, header, etc.
  return (
    <div>
      {/* Potential Admin Header */}
      <main>{children}</main>
      {/* Potential Admin Footer */}
    </div>
  );
}
