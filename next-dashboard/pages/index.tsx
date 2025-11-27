import Head from 'next/head';
import { OverviewCards } from '../components/OverviewCards';
import { Section } from '../components/Section';
import { vehicles, withdrawals } from '../data/mockData';

export default function DashboardPage() {
  return (
    <>
      <Head>
        <title>Lipa Fare | Dashboard</title>
      </Head>
      <h1 style={{ marginTop: 0 }}>Dashboard overview</h1>
      <OverviewCards />

      <Section title="Live vehicles" cta={<a className="button secondary" href="/vehicles">View all</a>} />
      <table className="table">
        <thead>
          <tr>
            <th>Plate</th>
            <th>Route</th>
            <th>Driver</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle.plate}>
              <td>{vehicle.plate}</td>
              <td>{vehicle.route}</td>
              <td>{vehicle.driver}</td>
              <td>
                <span className="tag">{vehicle.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Section title="SACCO admin controls" />
      <div className="card-grid">
        <div className="card">
          <h3>Member oversight</h3>
          <div className="muted">Approve vehicles and drivers, and freeze rogue assets in one click.</div>
        </div>
        <div className="card">
          <h3>Compliance</h3>
          <div className="muted">Export manifests, NTSA/route documents, and audit-ready statements.</div>
        </div>
        <div className="card">
          <h3>Control center</h3>
          <div className="muted">Tune fare splits, SACCO dues, and payout limits without code changes.</div>
        </div>
      </div>

      <Section title="Latest withdrawal requests" cta={<a className="button secondary" href="/withdrawals">Manage</a>} />
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Destination</th>
            <th>Amount (KSh)</th>
            <th>Status</th>
            <th>Requested</th>
          </tr>
        </thead>
        <tbody>
          {withdrawals.map((wd) => (
            <tr key={wd.id}>
              <td>{wd.id}</td>
              <td>{wd.destination}</td>
              <td>{wd.amount}</td>
              <td>
                <span className="tag">{wd.status}</span>
              </td>
              <td>{wd.requestedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
