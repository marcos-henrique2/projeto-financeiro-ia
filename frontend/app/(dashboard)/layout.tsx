// frontend/app/(dashboard)/layout.tsx
'use client';

// A importação foi corrigida para usar o atalho @/
import Navbar from '@/components/navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <main className="container mx-auto p-8">{children}</main>
    </div>
  );
}