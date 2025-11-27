export const summaryCards = [
  { label: 'Today collections', value: 'KSh 128,400', hint: '+12% vs yesterday' },
  { label: 'Active vehicles', value: '42', hint: 'Across 6 routes' },
  { label: 'Wallet balance', value: 'KSh 2,450,300', hint: 'Main + sub-wallets' },
  { label: 'Pending withdrawals', value: 'KSh 183,000', hint: '12 requests' },
];

export const vehicles = [
  { plate: 'KBA 123A', route: 'CBD ↔ Rongai', fare: '80', status: 'Active', driver: 'Jane Mwangi' },
  { plate: 'KCE 456B', route: 'CBD ↔ Thika', fare: '120', status: 'Active', driver: 'Peter Kamau' },
  { plate: 'KCX 789C', route: 'CBD ↔ Ngong', fare: '100', status: 'On break', driver: 'Ali Said' },
];

export const walletBalances = [
  { name: 'Master Wallet', balance: 1200300 },
  { name: 'Fuel', balance: 210400 },
  { name: 'Maintenance', balance: 154800 },
  { name: 'SACCO', balance: 80200 },
  { name: 'Insurance', balance: 120500 },
  { name: 'Profit', balance: 521400 },
];

export const subWalletSplits = [
  { vehicle: 'KBA 123A', splits: { fuel: 0.12, maintenance: 0.08, sacco: 0.05, insurance: 0.05, profit: 0.7 } },
  { vehicle: 'KCE 456B', splits: { fuel: 0.1, maintenance: 0.1, sacco: 0.05, insurance: 0.05, profit: 0.7 } },
];

export const withdrawals = [
  { id: 'WD-3021', destination: 'M-Pesa - 07xx123123', amount: '15,000', status: 'Processing', requestedAt: 'Today 09:10' },
  { id: 'WD-3018', destination: 'Co-op Bank 123456', amount: '65,000', status: 'Paid', requestedAt: 'Yesterday' },
];

export const reports = [
  { period: 'Today', total: '128,400', trips: 162, downloadUrl: '#' },
  { period: 'This week', total: '812,500', trips: 930, downloadUrl: '#' },
  { period: 'This month', total: '3,142,700', trips: 3560, downloadUrl: '#' },
];
