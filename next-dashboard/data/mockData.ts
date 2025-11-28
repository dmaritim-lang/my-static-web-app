export const summaryCards = [
  { label: 'Today collections', value: 'KSh 128,400', hint: '+12% vs yesterday' },
  { label: 'Active vehicles', value: '42', hint: 'Across 6 routes' },
  { label: 'Wallet balance', value: 'KSh 2,450,300', hint: 'Main + sub-wallets' },
  { label: 'Pending withdrawals', value: 'KSh 183,000', hint: '12 requests' },
];

export const fareTrends = [
  { label: 'Mon', value: 18 },
  { label: 'Tue', value: 22 },
  { label: 'Wed', value: 20 },
  { label: 'Thu', value: 24 },
  { label: 'Fri', value: 27 },
  { label: 'Sat', value: 30 },
  { label: 'Sun', value: 16 },
];

export const topRoutes = [
  { route: 'CBD ↔ Rongai', revenue: 'KSh 412,000', trips: 118 },
  { route: 'CBD ↔ Thika', revenue: 'KSh 367,500', trips: 102 },
  { route: 'CBD ↔ Ngong', revenue: 'KSh 298,200', trips: 90 },
];

export const loyaltyStats = {
  earnedToday: 6420,
  redeemedToday: 1120,
  members: 12800,
};

export const vehicles = [
  { plate: 'KBA 123A', route: 'CBD ↔ Rongai', fare: '80', status: 'Active', driver: 'Jane Mwangi' },
  { plate: 'KCE 456B', route: 'CBD ↔ Thika', fare: '120', status: 'Active', driver: 'Peter Kamau' },
  { plate: 'KCX 789C', route: 'CBD ↔ Ngong', fare: '100', status: 'On break', driver: 'Ali Said' },
];

export const vehicleLeaders = [
  { plate: 'KCE 456B', amount: 'KSh 82,000', change: '+18%' },
  { plate: 'KBA 123A', amount: 'KSh 78,300', change: '+10%' },
  { plate: 'KCX 789C', amount: 'KSh 65,900', change: '+6%' },
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
