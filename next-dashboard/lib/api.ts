import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:7071',
});

export async function fetchDashboardSummary() {
  // Replace with real API once available
  return api.get('/api/dashboard');
}

export async function listVehicles() {
  return api.get('/api/vehicles');
}

export async function fetchWallets() {
  return api.get('/api/wallets');
}

export async function submitWithdrawal(payload: {
  amount: number;
  channel: 'mpesa' | 'bank';
  destination: string;
}) {
  return api.post('/api/withdrawals', payload);
}

export async function downloadReport(period: string) {
  return api.get(`/api/reports?period=${period}`);
}
