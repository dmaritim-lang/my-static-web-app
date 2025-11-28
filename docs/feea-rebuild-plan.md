# FEEA Rebuild Blueprint

A concise plan to recreate and perfect the Lipa Fare system under the new name **FEEA**, covering backend, frontend, data, and delivery controls.

## Objectives
- Rebrand and refactor the platform as FEEA with production-grade quality.
- Harden payments, wallet splits, loyalty, and reporting for reliability and auditability.
- Ship polished user experiences across mobile, web dashboard, and USSD.

## Architecture Overview
- **API Gateway**: Single entry with auth, rate limits, request logging.
- **Services**: Auth & Identity, Vehicle & SACCO registry, Wallet & Ledger, Payments (M-Pesa/B2B/B2C), Loyalty, USSD, Notifications, Reporting/Analytics, Admin/Config.
- **Data**: PostgreSQL (core), Redis (sessions/cache), Kafka/RabbitMQ (events), S3-compatible storage (reports/exports/logs).
- **Security**: OAuth2/JWT, RBAC, encrypted secrets, audit logs, idempotent payment handling, PII minimization.

## Backend (NestJS, TypeScript)
- **Auth & Identity**: Phone/OTP login, role management (passenger, owner, driver, SACCO admin, vendor, ops admin), session revocation, device binding for high-risk roles.
- **Vehicle & SACCO**: Plate/IMEI/VIN registration, route metadata, fare tables, split rules versioned per vehicle, SACCO approvals, driver assignment with validity windows.
- **Wallet & Ledger**: Master + sub-wallets (fuel, maintenance, SACCO, insurance, loan, profit, platform commission), double-entry immutable ledger, clearing accounts for channels, idempotency keys, reversible only via compensating entries.
- **Payments (M-Pesa/Banks)**:
  - C2B callbacks: validate account ref (plate/QR), amount bands, MSISDN/passenger mapping; enqueue event; process idempotently.
  - B2C/B2B: payouts to owners/vendors; webhook reconciliation; retry/backoff; status mirror table.
  - Commission engine: configurable per SACCO/vehicle; tax-ready fields.
- **Loyalty**: Earn rules per route/time band; redemption generating internal credit; tiering (bronze/silver/gold) hooks; expiry sweeps.
- **USSD Service**: Short menus for pay fare, redeem points, owner balances, quick registration; Redis sessions; graceful timeouts.
- **Notifications**: SMS/email/push templates for payments, withdrawals, loyalty, exceptions; provider fallback.
- **Reporting & Analytics**: Daily digests, manifests, reconciliation exports, SACCO dashboards, fraud signals (velocity, duplicate refs).

## Frontend
- **Passenger Mobile (React Native)**: OTP login, pay fare (plate + QR), saved plates, trip history, loyalty balance/redemption, receipts, offline queue for fare intents.
- **Owner/SACCO Dashboard (Next.js)**: Overview KPIs, vehicle & route management, wallet and sub-wallet views, withdrawal flows (M-Pesa/bank), split rule editor with simulations, reports export, user management for staff.
- **Admin Console**: Approvals, overrides, risk flags, audit trails, config toggles.
- **Design System**: Shared UI kit (buttons, forms, tables, alerts), light/dark themes, localization hooks.

## Data Model Highlights
- Core tables: users, roles, user_profiles, devices, vehicles, vehicle_split_rules (versioned), saccos, routes, wallets, wallet_accounts, ledger_entries, transactions, payments (channel-facing), payout_requests, loyalty_accounts, loyalty_transactions, ussd_sessions, vendors, vendor_transactions, audit_logs.
- Indexing: composite keys on (vehicle_id, status, created_at), (user_id, role), (transaction_ref, channel), (wallet_account_id, created_at), partial indexes on open payouts, BRIN on ledger for time-range scans.

## Delivery Plan (phased)
1. **Foundation**: Set secrets via SSM/Secret Manager; wire CI/CD; add static analysis (eslint, prettier, type-check, unit tests) and migration tooling; seed sandbox creds.
2. **Payments & Ledger First**: Implement C2B intake → ledger → splits → notifications; add reconciliation job; prove idempotency with tests.
3. **Wallet UX**: Dashboard wallet views, withdrawals, sub-wallet breakdown; owner onboarding; SACCO approvals.
4. **Loyalty & USSD**: Loyalty earn/redeem, USSD flows (pay, redeem, balances), SMS confirmations.
5. **Polish & Scale**: Performance tuning, caching hot lookups, alerting, dashboards (Grafana), backup/restore drills, security review.
6. **Pilot & Iterate**: Limited SACCO rollout, feedback loop, adjust fares/splits/loyalty, monitor error budgets, ready B2B/B2C payouts.

## Quality & Risk Controls
- **Testing**: Unit + integration for payments/ledger; contract tests for M-Pesa/B2C; USSD flow tests with session fixtures; snapshot tests for UI.
- **Observability**: Structured logs with correlation IDs, metrics (latency, error rate, TPS, ledger imbalance alerts), distributed tracing.
- **Resilience**: Idempotency keys on payments/payouts; retry with backoff; circuit breakers for downstream APIs; dead-letter queues.
- **Security & Compliance**: Least-privilege roles, encrypted secrets, PII minimization, audit trails, data retention policies, GDPR/ODPC alignment.
- **Change Management**: Feature flags for high-risk changes (splits, loyalty rules), blue/green or canary deploys, runbooks for rollback.

## Migration from Current Build
- Freeze legacy data; export vehicles/users/wallet balances; replay ledger entries into new schema with checksums.
- Map existing plates and wallets to FEEA IDs; verify balances per sub-wallet; run shadow mode before cutover.
- Communicate downtime window; post-cutover reconciliation against M-Pesa statements.

## What to Build First (Day 1-5)
- Stand up repo `feea` with packages: `backend/`, `dashboard/`, `mobile/`, `infra/`, `docs/`.
- Scaffold NestJS services with shared libs (auth, db, events, validation).
- Implement C2B callback → ledger → split pipeline with tests and fixtures.
- Build minimal dashboard pages: balances, withdrawals, vehicles, reports download.
- Add RN screens for login, pay via plate/QR, loyalty view/redeem.
- Set up Redis, Postgres (migrations), and message broker locally via Docker Compose.

## How to Manage Development
- Weekly goals with demoable outcomes (payments OKR first).
- Definition of Done: tests pass, lint/type-check clean, logs structured, metrics emitted, docs updated.
- Use trunk-based development with short-lived branches; protect main with CI gates.
- Track incidents and action items; enforce on-call with runbooks.
