import Head from 'next/head';
import { useState } from 'react';
import { Section } from '../components/Section';
import { withdrawals } from '../data/mockData';
import { submitWithdrawal } from '../lib/api';

export default function WithdrawalsPage() {
  const [amount, setAmount] = useState('5000');
  const [channel, setChannel] = useState<'mpesa' | 'bank'>('mpesa');
  const [destination, setDestination] = useState('07xx123123');
  const [status, setStatus] = useState<string>('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await submitWithdrawal({ amount: Number(amount), channel, destination });
      setStatus('Submitted to backend');
    } catch (error) {
      setStatus('Would call backend here.');
    }
  }

  return (
    <>
      <Head>
        <title>Lipa Fare | Withdrawals</title>
      </Head>
      <h1 style={{ marginTop: 0 }}>Withdrawal to M-Pesa / Bank</h1>

      <Section title="New request" />
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <label htmlFor="amount">Amount (KSh)</label>
            <input id="amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="1000" />
          </div>
          <div>
            <label htmlFor="channel">Channel</label>
            <select id="channel" value={channel} onChange={(e) => setChannel(e.target.value as 'mpesa' | 'bank')}>
              <option value="mpesa">M-Pesa (B2C)</option>
              <option value="bank">Bank (B2B)</option>
            </select>
          </div>
          <div>
            <label htmlFor="destination">Destination (phone or account)</label>
            <input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="07xx... or bank account"
            />
          </div>
        </div>
        <button className="button" type="submit">
          Submit request
        </button>
        {status && <p className="muted">{status}</p>}
      </form>

      <Section title="Recent requests" />
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
