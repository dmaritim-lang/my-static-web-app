# FEEA System Review and Gap Analysis

## Context and intent
- The platform aims to deliver a nationwide, cashless fare solution with USSD, mobile, and web channels, automated wallet splitting (fuel, maintenance, SACCO, insurance, profit, commission), loyalty rewards, and integrations to M-Pesa, banks, vendors, and SACCO governance. 【F:docs/lipa-fare-technical-documentation.md†L5-L156】
- The rebuilt blueprint already outlines a production-grade, multi-service architecture (API gateway, auth, vehicles/SACCO registry, wallet/ledger, payments with C2B/B2B/B2C, loyalty, USSD, notifications, reporting, admin) plus delivery controls. 【F:docs/feea-rebuild-plan.md†L5-L71】

## What exists today (snapshot)
- **Backend (NestJS, in-memory demo)**: Implements vehicles, wallet splits, loyalty awards/redemption, and USSD flows; uses an in-memory store instead of Postgres, so data resets on restart and lacks persistence/audit durability. 【F:backend/src/common/in-memory.store.ts†L4-L109】【F:backend/src/wallet/wallet.service.ts†L9-L174】【F:backend/src/ussd/ussd.service.ts†L33-L199】
- **USSD menus**: Short flows for fare payment, loyalty redemption, owner balance checks, and quick vehicle registration with Redis-backed session handling. 【F:backend/src/ussd/ussd.service.ts†L33-L199】
- **Dashboard (Next.js)**: Catchr-inspired overview with KPIs, route performance, SACCO admin highlights, and withdrawal list for corporate users. 【F:next-dashboard/pages/index.tsx†L9-L100】
- **Documentation**: Comprehensive technical guide and rebuild plan describe channels, APIs, database tables, dashboards, USSD flow, and AWS Docker deployment. 【F:docs/lipa-fare-technical-documentation.md†L5-L156】【F:docs/feea-rebuild-plan.md†L5-L71】

## Gaps against the original objectives
- **Persistence and auditability**: No PostgreSQL schema or migrations wired into the running backend; all data is volatile and cannot satisfy reconciliation or KCB-grade audit needs. 【F:backend/src/common/in-memory.store.ts†L4-L109】
- **Real integrations**: M-Pesa, bank, vendor, and insurance APIs are stubbed/simulated; there is no credentialed Daraja client, bank rails, or vendor payout flows beyond placeholders. 【F:backend/src/payments/mpesa.service.ts†L1-L123】
- **Security and auth**: Auth uses plain passwords without OTP, RBAC, session revocation, or device binding; no encryption or secrets management is configured. 【F:backend/src/common/in-memory.store.ts†L4-L109】
- **SACCO governance features**: Dashboard shows SACCO admin cards but lacks real approval workflows, role scoping, fleet policy enforcement, or audit trails. 【F:next-dashboard/pages/index.tsx†L60-L74】
- **Corporate-grade dashboards**: UI is mock-data only; no live charts, filters, or exports connected to backend ledgers and payouts. 【F:next-dashboard/pages/index.tsx†L25-L100】
- **Mobile experience**: React Native screens are sample-only with no secure auth, QR scanning, offline intent queue, or production build scripts. 【F:docs/lipa-fare-technical-documentation.md†L128-L135】
- **Resilience and observability**: No idempotency store, retries, metrics, tracing, or alerting implemented to handle C2B/B2C/B2B reliably. 【F:docs/feea-rebuild-plan.md†L47-L53】
- **Compliance/readiness**: No KYC capture, PII handling, consent, or data retention controls in code; necessary for banking-grade (KCB-like) expectations.

## Recommendations to align with the intent (priority order)
1. **Stand up durable data & migrations**: Introduce PostgreSQL with Prisma/TypeORM migrations for users, vehicles, SACCOs, wallets, ledger, payments, loyalty, USSD sessions, and vendors; remove in-memory store after bootstrapping fixtures. Map ledger to immutable double-entry rows with audit metadata.
2. **Harden payments & ledger**: Implement real Daraja C2B validation/confirmation with idempotency keys, B2C/B2B payout jobs, reconciliation tables, and dead-letter queues. Add channel clearing accounts and per-vehicle split rule versions with effective dates.
3. **Secure auth like a bank app**: Add phone/OTP login, RBAC scopes for passenger/owner/SACCO/admin/vendor, password/PIN rules, device binding for owners/drivers, and JWT/refresh tokens with revocation lists. Centralize secrets via environment vault (e.g., AWS Secrets Manager).
4. **Corporate SACCO dashboard**: Replace mock data with API calls to ledger balances, add approvals (vehicles, drivers), policy controls (split limits, payout caps), CSV/PDF exports, and manifest generation. Provide granular filters and time-series charts.
5. **Vendor/bank API surface**: Expose authenticated partner endpoints for insurance, fuel, spares, and bank payouts with webhook callbacks; model vendor contracts and fee schedules.
6. **USSD productionization**: Persist sessions in Redis with expiry, add short-code error handling, back navigation, and STK push initiation; cap menu latency and log telemetry.
7. **Mobile app parity with KCB-style UX**: Implement OTP, biometric unlock (where supported), QR/plate pay, trip receipts, loyalty wallet, and offline queueing of fare intents with background sync; add crash/error reporting.
8. **Observability & compliance**: Add structured logs with correlation IDs, metrics (TPS, latency, error rate, ledger imbalance), tracing, and alerting. Implement KYC data capture, consent flows, PII minimization, encryption at rest/in transit, and retention policies aligned to ODPC/CBK guidance.

## Next steps for this codebase
- Create a `database` package (migration tool + seed data) and rewire services to Postgres.
- Replace mock data in dashboard and RN app with live API clients; secure APIs with JWT and role checks.
- Build integration stubs as contracts (OpenAPI/JSON examples) and then swap in real Daraja/bank credentials in staging with sandbox tests.
- Add CI checks (lint, type-check, tests) and container builds; set up environment configs for dev/staging/prod.
