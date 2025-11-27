const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

export type AuthResponse = { token: string; userId: string };
export type Trip = { id: string; vehiclePlate: string; amount: number; timestamp: string };
export type LoyaltyBalance = { points: number; lifetime: number };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }

  return response.json();
}

export async function login(phone: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export async function payFare(token: string, plate: string, amount: number, passengerPhone: string) {
  return request('/payments/c2b', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ plate, amount, msisdn: passengerPhone }),
  });
}

export async function redeemPoints(token: string, plate: string, points: number) {
  return request('/wallet/redeem', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ plate, points }),
  });
}

export async function fetchTrips(token: string): Promise<Trip[]> {
  return request<Trip[]>('/wallet/trips', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function fetchLoyalty(token: string): Promise<LoyaltyBalance> {
  return request<LoyaltyBalance>('/wallet/loyalty', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
