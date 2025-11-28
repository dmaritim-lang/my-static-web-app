# Lipa Fare: Digital Fare & Ecosystem Payment Platform (Kenya)

## 1. Abstract
Lipa Fare is a cashless, real-time fare payment platform for PSVs and boda bodas in Kenya. Passengers pay via USSD, mobile app, or web, using the vehicle/bike registration number as the primary identifier. Funds are routed instantly to owner settlement endpoints (bank, M-Pesa/e-wallet, paybill, till) and configurable virtual sub-accounts (fuel, maintenance, insurance, loan, SACCO, profit) while deducting platform commission. The system also powers loyalty points and ecosystem payments (fuel, spares, insurance) and exposes auditable data for compliance, lending, and operational efficiency.

## 2. Architecture Overview
- **Channels**: USSD (*xxx#), Android/iOS app (React Native), web dashboards (Next.js) for owners/SACCOs, admin console.
- **Gateway & Security**: API Gateway (Kong/Nginx/AWS API Gateway) with OAuth2/JWT via Keycloak/Auth0; WAF + rate limiting.
- **Core Microservices** (NestJS/TypeScript):
  - Auth & Identity
  - User & Profile
  - Vehicle & SACCO Registry
  - Pricing & Routes
  - Wallet & Ledger
  - Payments (M-Pesa C2B/B2B/B2C + bank integrations)
  - Loyalty & Rewards
  - USSD Orchestrator
  - Notifications (SMS/Email/Push)
  - Reporting & Analytics
  - Admin & Configuration
- **Data Stores**: PostgreSQL (ACID, ledgers), Redis (sessions/USSD state/cache), Kafka/RabbitMQ (events), Object storage (S3/GCS) for reports and artifacts.
- **Observability & Ops**: Prometheus/Grafana/Loki or ELK, Sentry, OpenTelemetry, CI/CD via GitHub Actions, IaC with Terraform; containerized with Docker → K8s (EKS/GKE/AKS) when scaling.

### High-Level Interaction
1. User request arrives via USSD/mobile/web → API Gateway → relevant microservice.
2. Payments service receives M-Pesa callbacks (C2B) or initiates payouts (B2C/B2B); publishes events.
3. Wallet & Ledger consumes events, validates idempotency, applies splits, records double-entry transactions, updates balances and loyalty.
4. Notifications service sends receipts; Reporting/Analytics ingests events for dashboards and reconciliation.

## 3. Core Services & Responsibilities
- **Auth & Identity**: Phone/OTP login, token issuance (JWT), RBAC, session revocation, audit trails.
- **User & Profile**: Passenger/owner/driver/SACCO/admin/vendor profiles, KYC data, document storage pointers.
- **Vehicle & SACCO Registry**: Vehicle/boda onboarding, plate-to-owner mapping, driver assignments, SACCO membership, route and fare configuration, revenue split rules per asset.
- **Pricing & Routes**: Fare tables by route/vehicle/time; discount rules and surge/off-peak promos.
- **Wallet & Ledger**:
  - Master wallet per vehicle/owner + sub-wallets (fuel, maintenance, insurance, loan, SACCO, profit, misc).
  - Loyalty wallets per passenger.
  - Double-entry ledger enforcing balanced debits/credits; immutable transaction history; idempotency keys.
- **Payments**:
  - Inbound: M-Pesa C2B paybill/till callbacks; validation (MSISDN, amount, account ref = plate/trip code); store Daraja metadata.
  - Outbound: M-Pesa B2C/B2B to owners/vendors; bank rails/virtual accounts where supported.
  - Commission calculation; dispute and reversal handling; reconciliation jobs vs. M-Pesa statements.
- **Loyalty & Rewards**: Earn rules (e.g., 1 point per KES X, route-based multipliers), redemption for fares or vendor offers, burn protection (caps/expiry), partner offer catalog.
- **USSD Orchestrator**: Stateless endpoints with Redis session store; flows for passenger payments, redemptions, owner balance inquiries, withdrawals, driver PIN spends, KYC.
- **Notifications**: SMS (Africa’s Talking/Twilio/Safaricom), email, push; templating and throttling.
- **Reporting & Analytics**: Dashboards for owners/SACCOs/admin; CSV/PDF exports; manifest generation; anomaly detection; regulatory reports.
- **Admin & Configuration**: Commission/loyalty rules, risk flags, manual adjustments with audit, vendor management.

## 4. Data Model (selected entities)
- **users** (id, phone, role, status, rbac_role, kyc_level, created_at)
- **profiles** (user_id FK, name, id_number, sacco_id FK, address, next_of_kin)
- **vehicles** (id, plate, type, sacco_id FK, owner_id FK, status, route_id FK)
- **drivers** (id, user_id FK, license_no, assigned_vehicle_id FK)
- **routes** (id, origin, destination, base_fare, fare_rules JSONB)
- **wallets** (id, owner_type [vehicle|user|platform], owner_id, currency)
- **wallet_accounts** (id, wallet_id FK, type [master|fuel|maintenance|insurance|loan|sacco|profit|loyalty], percentage_split, balance)
- **transactions** (idempotency_key, type, amount, currency, status, metadata JSONB, created_at)
- **ledger_entries** (transaction_id FK, account_id FK, direction [debit|credit], amount, balance_after, created_at)
- **fares** (id, passenger_id FK, vehicle_id FK, route_id FK, amount, payment_channel, trip_ref, loyalty_points_awarded)
- **loyalty_accounts** (user_id FK, balance, tier)
- **loyalty_transactions** (id, account_id FK, type [earn|redeem|adjust], points, ref, created_at)
- **ussd_sessions** (session_id, msisdn, state, data JSONB, expires_at)
- **vendors** (id, category, name, paybill, settlement_account)
- **vendor_transactions** (id, vendor_id FK, wallet_account_id FK, amount, status, metadata)

## 5. Key Flows
### Fare Payment via USSD (M-Pesa C2B)
1. Passenger dials USSD → enters vehicle plate and fare amount (or sees suggested fare by route).
2. Platform prompts STK push or uses paybill reference; passenger pays.
3. Safaricom sends C2B callback → Payments service validates + emits `fare.payment.received` event.
4. Wallet & Ledger applies splits (commission + configured sub-wallet percentages), records ledger entries, updates balances and loyalty.
5. Notifications send SMS to passenger and owner; Reporting updates metrics.

### Fare Payment via Mobile App
1. Passenger logs in with phone OTP; scans vehicle QR or enters plate; sees fare estimate.
2. Initiates M-Pesa STK push or wallet/points redemption.
3. Payment callback triggers same event pipeline → ledger splits → confirmations.

### Withdrawal / Settlement (Owner)
1. Owner requests payout from master wallet to bank/M-Pesa.
2. Wallet checks available balance + risk rules; creates transaction and locks funds.
3. Payments service executes B2C/B2B; on success, ledger posts debit master wallet/credit payout channel; notifications dispatched.

### Loyalty Redemption
1. Passenger selects “Redeem fare” (USSD or app); system validates points and fare cap.
2. Loyalty service burns points, creates internal credit to vehicle master wallet; ledger reflects platform-funded fare; payment confirmation sent.

### Driver Spend from Sub-Accounts
1. Owner generates one-time spend PIN/voucher for fuel/maintenance.
2. Driver presents PIN at partner vendor; vendor USSD/web verifies and triggers wallet debit to vendor paybill/till; ledger + notifications fire.

## 6. Security, Risk & Compliance
- OAuth2/JWT, short-lived access tokens, refresh tokens; device binding for mobile.
- RBAC & ABAC per role (passenger/owner/driver/sacco/admin/vendor).
- Data encryption at rest (PostgreSQL, object storage) and TLS in transit.
- Strict idempotency on payment and ledger writes; replay protection; HMAC-signed webhooks.
- Audit logs for admin actions, reversals, config changes; tamper-evident log store.
- PII minimization and retention aligned to Kenya Data Protection Act; consent and privacy notices; data subject rights workflows.
- Rate limiting, WAF, input validation (OWASP ASVS); secrets managed in vault (AWS Secrets Manager/HashiCorp Vault).
- Reconciliation jobs vs. M-Pesa statements; alerts on variances and unusual patterns.

## 7. Non-Functional Requirements
- **Availability**: Target 99.9%+; multi-AZ database; load-balanced stateless services; graceful degradation for USSD if SMS fallback needed.
- **Performance**: <300 ms p99 for common API calls; USSD steps <1.5s; cache vehicle configs in Redis; async queues for heavy tasks.
- **Scalability**: Horizontal scaling per microservice; event-driven; sharding strategy for ledger if needed; partitioned tables for transactions.
- **Reliability**: Idempotent processors; dead-letter queues; retry with backoff; circuit breakers for external APIs.
- **Observability**: Structured logging with trace IDs; metrics for TPS, latency, error rate; alerts via PagerDuty/Slack.

## 8. Tech Stack Summary
- **Backend**: TypeScript, NestJS, Node.js; Jest for testing.
- **Frontend**: React Native (mobile), React + Next.js (web), shared design system (Storybook).
- **Data**: PostgreSQL, Redis, Kafka/RabbitMQ, S3/GCS.
- **Integrations**: Safaricom Daraja (C2B/B2B/B2C), USSD gateway, SMS gateway, bank/virtual account APIs, QR generator.
- **DevOps**: Docker, GitHub Actions CI/CD, Terraform, Kubernetes (as scale grows), OpenAPI/Swagger for API docs.

## 9. MVP Scope (first pilot)
- Core services: Auth, User/Profile, Vehicle & SACCO, Payments (C2B), Wallet & Ledger (splits + commission), USSD flows for fare payment, Notifications (SMS), minimal Owner dashboard (collections/balances), basic reporting exports.
- Limited geographies: one SACCO/route; Android + USSD only; cash-in via M-Pesa paybill; payouts manual or B2C limited.
- Success metrics: transaction success rate, USSD completion rate, reconciliation variance <0.1%, owner NPS, time-to-settlement.

## 10. Development Roadmap
### Phase 0 – Foundation (business/legal/partnerships)
- Company registration confirmation; operational + trust accounts.
- Engage Safaricom/telcos for USSD short code, paybill/till, API access; bank partners for direct settlement/virtual accounts.
- Regulatory alignment with CBK, ODPC; decide licensing path (partner vs. own PSP license).
- Partnership MOUs with SACCOs, owner associations, vendors (fuel, spares, insurance), NTSA/police data access.

### Phase 1 – Product Definition & UX
- Finalize personas and user stories for MVP.
- Produce USSD, mobile, and dashboard flows (Figma/Whimsical); define loyalty rules and split configs.

### Phase 2 – Engineering Enablement
- Repos, branch strategy, CI/CD (GitHub Actions), IaC (Terraform); environment setup (dev/stage/prod); secrets management.
- Logging/metrics baseline, API style guide, coding standards; QA plan.

### Phase 3 – Architecture & Data Model
- Freeze service boundaries and schemas; publish OpenAPI contracts; define events (`fare.payment.received`, `wallet.split.applied`, `payout.completed`, etc.).

### Phase 4 – Payments & Wallet Core
- Implement M-Pesa C2B intake with idempotent callbacks; ledger + splitting engine; commission; loyalty earn; basic reconciliation.
- Owner withdrawal (B2C) happy path; SMS receipts; error handling and retries.

### Phase 5 – USSD Application
- Build Redis-backed session handler; implement passenger pay, redeem, and owner balance/withdraw flows; integrate with payments/ledger.
- Performance testing with telco sandbox; optimize prompts for <180s sessions.

### Phase 6 – Mobile & Web
- React Native passenger app (OTP login, pay by plate/QR, trip history, points); Next.js owner dashboard (collections, balances, statements export).

### Phase 7 – Hardening
- Security review (OWASP ASVS), load testing, failover drills; monitoring/alerting; data protection compliance artifacts.

### Phase 8 – Pilot & Iterate
- Pilot with one SACCO/route; monitor metrics; refine loyalty and UX; expand to vendors and more geographies post-pilot.

## 11. Open Questions / Next Decisions
- Loyalty formula and funding source (marketing budget vs. interchange/commission share).
- Exact revenue split defaults per SACCO/route; configurable caps/minimums.
- Reversal/dispute policy with M-Pesa; chargeback handling; offline voucher support during M-Pesa downtime.
- Vendor settlement cycles and fees; onboarding/KYC workflow for vendors.
- Data residency requirements and retention schedules per regulator/partner.
