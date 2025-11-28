import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';

const links = [
  { href: '/', label: 'Overview' },
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
        <div className="brand">
          <div className="brand-mark">⚡</div>
          <div>
            <div className="brand-title">FEEA</div>
            <div className="brand-sub">Fare & Ecosystem Analytics</div>
          </div>
        </div>
        <nav>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={pathname === link.href ? 'active' : ''}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-note">Live payment telemetry, loyalty, and wallet health in one place.</div>
      </aside>
      <main className="content">
        <header className="page-top">
          <div>
            <p className="eyebrow">Kenya PSV / boda platform</p>
            <h1>Operations cockpit</h1>
            <p className="muted">
              Track fare inflows, automate splits, and keep SACCO compliance tidy. Built on top of the
              NestJS + Next.js starter shipped in this repo.
            </p>
          </div>
          <div className="top-actions">
            <a className="button" href="/wallets">Wallets</a>
            <a className="button secondary" href="/reports">Export</a>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
