# FEEA (Fare & Ecosystem Analytics) – local setup

This repository already contains the NestJS backend and the Next.js dashboard for the FEEA rebuild. Use the steps below to clone and run everything locally.

## 1) Clone the repo
```bash
git clone https://github.com/<your-org>/feea.git
cd feea
```

## 2) Backend (NestJS)
1. Install Node.js LTS (>=18).
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Run the API:
   ```bash
   npm run start:dev
   ```
   The API listens on http://localhost:3000.
4. Environment variables to wire later:
   - `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`
   - `MPESA_SHORTCODE`, `MPESA_ENV` (`sandbox`|`production`)
   - `REDIS_URL` (for USSD session storage)

## 3) Dashboard (Next.js)
1. Open a new terminal:
   ```bash
   cd next-dashboard
   npm install
   npm run dev
   ```
2. Visit http://localhost:3001 (if you set `PORT=3001`) or the port shown in the console.
3. The dashboard uses mock data today; swap the API placeholders in `next-dashboard/lib/api.ts` with your backend endpoints when ready.

## 4) Mobile (React Native starter)
The `react-app/src/rn` folder holds starter screens. Use Expo or React Native CLI to bootstrap a full project and copy these screens + `api.ts` into it.

## 5) Docker
Dockerfiles are provided in `backend/Dockerfile` and `next-dashboard/Dockerfile` if you prefer containers.

## 6) Quick sanity checks
- Backend health: `curl http://localhost:3000/vehicles`
- Dashboard: ensure the landing page renders the analytics cards and trend bars.

When you are ready for production, point M-Pesa callbacks to `/payments/c2b/validate` and `/payments/c2b/confirm` on the backend and place the dashboard behind your desired cloud front door (ALB/CloudFront).
