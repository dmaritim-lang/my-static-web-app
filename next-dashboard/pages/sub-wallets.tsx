import Head from 'next/head';
import { Section } from '../components/Section';
import { subWalletSplits } from '../data/mockData';

export default function SubWalletsPage() {
  return (
    <>
      <Head>
        <title>Lipa Fare | Sub-wallet breakdown</title>
      </Head>
      <h1 style={{ marginTop: 0 }}>Sub-wallet breakdown</h1>
      <p className="muted">
        Each fare is split instantly into your configured virtual accounts so fuel, maintenance,
        SACCO obligations, insurance, and profit are always funded.
      </p>

      {subWalletSplits.map((vehicle) => (
        <div className="card" key={vehicle.vehicle} style={{ marginBottom: '1rem' }}>
          <div className="section-title" style={{ margin: 0 }}>
            <h3 style={{ margin: 0 }}>{vehicle.vehicle}</h3>
            <span className="muted">Configured percentages</span>
          </div>
          <div className="badge-row">
            <span className="badge">Fuel: {(vehicle.splits.fuel * 100).toFixed(0)}%</span>
            <span className="badge">Maintenance: {(vehicle.splits.maintenance * 100).toFixed(0)}%</span>
            <span className="badge">SACCO: {(vehicle.splits.sacco * 100).toFixed(0)}%</span>
            <span className="badge">Insurance: {(vehicle.splits.insurance * 100).toFixed(0)}%</span>
            <span className="badge">Profit: {(vehicle.splits.profit * 100).toFixed(0)}%</span>
          </div>
        </div>
      ))}

      <Section title="How it works" />
      <ol style={{ color: 'var(--muted)' }}>
        <li>Passenger pays fare via USSD/App → M-Pesa C2B callback hits backend.</li>
        <li>Wallet engine posts the incoming credit and auto-splits using these percentages.</li>
        <li>Balances update instantly and are available for payouts or vendor payments.</li>
      </ol>
    </>
  );
}
