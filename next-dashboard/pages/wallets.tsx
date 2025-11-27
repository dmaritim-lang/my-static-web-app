import Head from 'next/head';
import { Section } from '../components/Section';
import { walletBalances } from '../data/mockData';

export default function WalletsPage() {
  const total = walletBalances.reduce((sum, wallet) => sum + wallet.balance, 0);

  return (
    <>
      <Head>
        <title>Lipa Fare | Wallet balances</title>
      </Head>
      <h1 style={{ marginTop: 0 }}>Wallet balances</h1>
      <div className="card-grid">
        <div className="card">
          <h3>Total across wallets</h3>
          <div className="value">KSh {total.toLocaleString()}</div>
          <div className="muted">Including sub-wallets</div>
        </div>
        {walletBalances.map((wallet) => (
          <div className="card" key={wallet.name}>
            <h3>{wallet.name}</h3>
            <div className="value">KSh {wallet.balance.toLocaleString()}</div>
            <div className="muted">Available to spend</div>
          </div>
        ))}
      </div>

      <Section title="Recent ledger entries" />
      <table className="table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Wallet</th>
            <th>Amount (KSh)</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Credit</td>
            <td>Master Wallet</td>
            <td>4,200</td>
            <td>Fare from KBA 123A</td>
          </tr>
          <tr>
            <td>Split</td>
            <td>Fuel</td>
            <td>600</td>
            <td>Automatic 12% allocation</td>
          </tr>
          <tr>
            <td>Split</td>
            <td>Maintenance</td>
            <td>420</td>
            <td>Automatic 8% allocation</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
