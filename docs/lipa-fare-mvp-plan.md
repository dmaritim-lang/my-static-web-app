# Lipa Fare MVP Plan (Essential-Only)

## Objective
Deliver a pilot-ready slice that proves end-to-end digital fare collection for one SACCO/route with USSD + M-Pesa C2B intake, automated wallet splitting, SMS receipts, and a minimal owner dashboard. Everything below is chosen for speed and buildability by a small team.

## Channels in Scope
- **USSD**: Primary passenger flow (pay by plate). Owner balance/withdraw menu (happy path only).
- **Web Dashboard (Owners/SACCO)**: Read-only collections view (by vehicle/day) + balance view + CSV export.
- **Mobile**: Not in scope for MVP (defer to post-pilot).

## Core Features (No Extras)
1. **Passenger Fare Payment (USSD + M-Pesa C2B)**
   - Input: vehicle plate + amount (or suggested fare).
   - Trigger STK push or paybill reference; accept Daraja C2B callbacks.
   - Validate idempotency via `MpesaReceiptNumber` + hash of msisdn/amount/plate.
2. **Wallet & Ledger (Splits + Commission)**
   - Master wallet per vehicle; sub-wallets: `fuel`, `maintenance`, `sacco`, `profit` (limit to four).
   - Configurable percentages per vehicle; platform commission rate (single global value).
   - Double-entry ledger with immutable rows; balance derived from ledger.
3. **Owner Withdrawals (B2C)**
   - Happy-path payout to owner MSISDN only (no banks yet).
   - Flat withdrawal fee; simple status updates (pending/success/failed) with retries.
4. **SMS Notifications**
   - Passenger receipt on payment; owner daily summary SMS (one per day) and on-withdrawal.
5. **Reporting & Exports**
   - Dashboard tables for collections and balances; CSV export for a date range.

## Tech Stack (Pragmatic Choices)
- **Backend**: Node.js 18 + TypeScript; NestJS (monolith mode with modules) to reduce complexity.
- **Database**: PostgreSQL 14 (transactions, ledger tables); Knex/TypeORM for migrations.
- **Cache/Session**: Redis for USSD session state.
- **Integrations**: Safaricom Daraja (C2B + B2C); SMS via Africa's Talking or Safaricom SMS.
- **Frontend**: Next.js 14 (React) for the owner dashboard; server-rendered pages + API routes.
- **Infra/DevOps**: Docker Compose for dev; single-node VM for staging/prod; GitHub Actions CI (lint + test + docker build); IaC optional post-pilot.

## Service Modules (inside one NestJS app)
- **Auth**: Phone number + OTP (stub SMS via AT); JWT issuance; roles: passenger, owner, sacco_admin.
- **Vehicles**: CRUD vehicles with plate, owner, sacco, split percentages.
- **Payments**: Daraja C2B callback endpoint, STK trigger, B2C payout; idempotency middleware.
- **Wallet/Ledger**: Ledger writer, balance projection, split engine (commission + sub-wallets), withdrawal workflow.
- **USSD**: Session controller using Redis; passenger pay + owner balance/withdraw menu.
- **Notifications**: SMS templates for receipts and summaries.
- **Dashboard API**: Collections list, balances, CSV export.

## Data Model (minimum tables)
- `users(id, phone, role, otp_secret, status, created_at)`
- `vehicles(id, plate, owner_id, sacco_id, status, split_fuel_pct, split_maint_pct, split_sacco_pct, split_profit_pct, commission_pct)`
- `wallets(id, vehicle_id, type [master|fuel|maintenance|sacco|profit], balance_cached)`
- `transactions(id, ext_ref, type [fare|withdrawal|adjustment], amount, currency, status, metadata, created_at)`
- `ledger_entries(id, transaction_id, wallet_id, direction [debit|credit], amount, created_at)`
- `ussd_sessions(session_id, msisdn, state, data_json, expires_at)`

## MVP Delivery Plan (4 Sprints)
- **Sprint 0: Foundations (1 week)**
  - Repo setup (NestJS, Next.js, PostgreSQL, Redis via Docker Compose).
  - CI lint/test; shared env config; base auth with OTP mock; DB migrations.
- **Sprint 1: Payments Intake + Ledger (2 weeks)**
  - Daraja C2B callback + STK trigger; idempotency guard; fare payment endpoint.
  - Ledger engine + splits (commission + four sub-wallets); balance projection.
  - SMS receipt on fare; basic error/retry logging.
- **Sprint 2: USSD + Owner Dashboard (2 weeks)**
  - USSD passenger pay flow; owner balance + withdraw menus (happy path).
  - Dashboard: login, collections table (filter by date/vehicle), balances, CSV export.
  - Daily summary SMS to owners; basic monitoring (health checks, request logs).
- **Sprint 3: Withdrawals & Pilot Readiness (2 weeks)**
  - B2C payout flow with retries + status updates; flat fee handling.
  - Reconciliation script: fetch previous-day Daraja statements and compare totals.
  - Pilot hardening: rate limiting, minimal RBAC, backup/restore runbook, sandbox-to-prod config.

## Out-of-Scope (defer)
- Mobile app, QR codes, vendor payments, bank payouts, dynamic pricing, loyalty, multi-SACCO routing, advanced risk/fraud.

## Pilot Definition & Success Criteria
- **Pilot**: One SACCO, ≤10 vehicles, one route, USSD + M-Pesa only.
- **SLAs**: 99% successful C2B callback processing; <2s USSD step latency; reconciliation variance <0.1% daily.
- **Metrics**: Transactions/day, successful USSD completion %, payout success %, ledger vs. M-Pesa variance.

## Quick Developer Checklist
- [ ] Provision paybill/till sandbox; register C2B URLs; obtain B2C credentials.
- [ ] Stand up Docker Compose (API, Postgres, Redis, Next.js, mock SMS).
- [ ] Implement C2B callback → ledger split → SMS receipt (single happy path).
- [ ] Build USSD menu (pay by plate) backed by Redis sessions.
- [ ] Build dashboard pages: login, collections, balances, CSV export.
- [ ] Enable B2C payout; lock master wallet during withdrawal to prevent double-spend.
- [ ] Add daily owner summary job + basic reconciliation script.
