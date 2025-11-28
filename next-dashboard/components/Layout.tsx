import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/vehicles', label: 'Vehicles & routes' },
  { href: '/wallets', label: 'Wallet balances' },
  { href: '/sub-wallets', label: 'Sub-wallet breakdown' },
  { href: '/withdrawals', label: 'Withdrawals' },
  { href: '/reports', label: 'Reports & statements' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useRouter();
  return (
    <div className="main-layout">
      <aside className="sidebar">
        <h2 style={{ color: 'white', margin: '0 0 1rem' }}>Lipa Fare</h2>
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={pathname === link.href ? 'active' : ''}>
            {link.label}
          </Link>
        ))}
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
