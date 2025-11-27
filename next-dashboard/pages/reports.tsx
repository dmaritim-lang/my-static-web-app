import Head from 'next/head';
import { Section } from '../components/Section';
import { reports } from '../data/mockData';
import { downloadReport } from '../lib/api';

export default function ReportsPage() {
  async function handleDownload(period: string) {
    try {
      await downloadReport(period);
      alert(`Would download ${period} report`);
    } catch (error) {
      alert('Download stub - hook to backend');
    }
  }

  return (
    <>
      <Head>
        <title>Lipa Fare | Reports & statements</title>
      </Head>
      <h1 style={{ marginTop: 0 }}>Reports & statements</h1>
      <p className="muted">Export statements for owners, SACCO admins, or auditors.</p>

      <Section title="Collections" />
      <table className="table">
        <thead>
          <tr>
            <th>Period</th>
            <th>Total (KSh)</th>
            <th>Trips</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.period}>
              <td>{report.period}</td>
              <td>{report.total}</td>
              <td>{report.trips}</td>
              <td>
                <button className="button secondary" type="button" onClick={() => handleDownload(report.period)}>
                  Download CSV/PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Section title="Statement examples" />
      <div className="card-grid">
        <div className="card">
          <h3>Owner statement</h3>
          <div className="muted">Daily fare collections by vehicle, withdrawals, net balance.</div>
        </div>
        <div className="card">
          <h3>SACCO statement</h3>
          <div className="muted">Aggregate collections per route, SACCO share, and payouts.</div>
        </div>
        <div className="card">
          <h3>Audit trail</h3>
          <div className="muted">Immutable ledger export with double-entry detail.</div>
        </div>
      </div>
    </>
  );
}
