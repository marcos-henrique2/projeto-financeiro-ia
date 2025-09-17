// frontend/app/(dashboard)/layout.tsx

import React from 'react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto p-8">
      <nav className="mb-6 border-b">
        <Link href="/kpis" className="inline-block p-4 border-b-2 border-transparent hover:border-gray-400">
          KPIs
        </Link>
        <Link href="/charts" className="inline-block p-4 border-b-2 border-transparent hover:border-gray-400">
          Gráficos
        </Link>
      </nav>
      <main>
        {children}
      </main>
    </div>
  );
}