// frontend/components/navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  // Vamos manter apenas os links para as páginas que já existem
  const navLinks = [
    { href: '/upload', label: 'Upload' },
    { href: '/kpis', label: 'KPIs' },
    { href: '/charts', label: 'Gráficos' },
  ];

  return (
    <header className="border-b mb-8">
      <nav className="container mx-auto flex items-center">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.label}
              href={link.href}
              // Aplica estilos diferentes se o link estiver ativo
              className={`p-4 text-sm font-medium hover:bg-gray-100 ${
                isActive ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}