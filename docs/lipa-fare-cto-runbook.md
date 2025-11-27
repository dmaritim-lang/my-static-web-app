# Lipa Fare CTO Runbook

A pragmatic, action-focused guide for getting the Lipa Fare platform built, launched, and operated safely. Follow the steps in order; they are written to be actionable for a lean team.

## 0) Decide the MVP slice and success criteria (today)
- Scope: USSD fare payment → M-Pesa C2B callback → wallet split (commission + owner + sub-wallets) → SMS receipt → owner dashboard totals for one SACCO, one route, a few vehicles.
- Success definition: 95%+ of fares on the pilot route processed cashless with correct splits; same-day settlement available; zero unreconciled transactions at end-of-day.

## 1) Business, legal, and access prerequisites (week 1)
- Company readiness: confirm bank accounts (operational + settlement). Assign a single finance owner.
- Regulatory: engage CBK/ODPC counsel to confirm if you operate under a licensed PSP/aggregator; document data-retention rules.
- Telco access: request Safaricom short code, M-Pesa Paybill/Till, and Daraja sandbox + production credentials. Ask for a USSD test window.
- Bank access: choose 1–2 banks for virtual accounts and payouts; request sandbox APIs and onboarding requirements.
- Contracts: draft NDAs and data-processing agreements for vendors/contractors.

## 2) Team and roles (week 1)
- Core: 1 backend (NestJS/TypeScript), 1 frontend (React/Next.js + React Native), 1 DevOps (AWS/Docker), 1 QA, 1 product/ops lead.
- Advisors: fintech compliance, M-Pesa integrations specialist (part-time), security reviewer (part-time).
- Ways of working: daily standup, weekly demo, Jira/Linear for tickets, GitHub PRs with code review, staging + prod environments.

## 3) Environment and keys setup (week 1–2)
- GitHub repos: backend, dashboard, mobile. Protect main branch; require reviews and CI.
- Secrets management: use AWS SSM Parameter Store or Secrets Manager; never commit keys. Set up least-privilege IAM roles.
- Environments: `dev` (sandbox), `staging` (telco/bank sandboxes + near-real data), `prod` (locked down).
- Observability: enable structured logging, CloudWatch dashboards, alarms for callback failures, error rates, and ledger imbalances.

## 4) Delivery plan (weeks 2–6)
1) **USSD + M-Pesa C2B path**
   - Build `/ussd` handler with Redis-backed sessions; implement pay-fare and redeem-points menus.
   - Expose C2B validation/confirmation endpoints; implement idempotency on transaction IDs.
   - Write unit tests for splits and idempotency; add sandbox callback fixtures.
2) **Wallet & ledger**
   - Implement double-entry ledger with immutable rows; enforce balance checks and per-wallet currency.
   - Configure sub-wallet rules per vehicle (fuel, maintenance, SACCO, insurance, profit, commission).
   - Add reconciliation job comparing M-Pesa statements vs ledger (daily in staging, then prod).
3) **Owner dashboard (Next.js)**
   - Views: daily totals by vehicle, balances by sub-wallet, withdrawal request form.
   - Add CSV export for day/week; show latest 20 transactions.
4) **Loyalty**
   - Award points per fare; redemption creates internal credit transaction; cap redemptions per day during pilot.
5) **Withdrawals (B2C/B2B)**
   - Allow owner-initiated payout to M-Pesa number or bank; require OTP + 4-eye approval for payouts > threshold.
6) **QA and pilot**
   - Staging test matrix: happy path, duplicate C2B callbacks, USSD timeout recovery, split edge cases (0%/100%), negative tests.
   - Pilot go/no-go checklist (see section 8).

## 5) Data model guardrails (implement immediately)
- Tables: users, roles, vehicles, owners, sacco_memberships, wallets, sub_wallets, ledger_entries, mpesa_callbacks, ussd_sessions, loyalty_accounts, loyalty_transactions.
- Immutability: ledger rows append-only; never update amounts after posting.
- Idempotency: unique constraint on (mpesa_transaction_id) for C2B; store checksum for request bodies.
- Audit: store who/what/when for payouts, split changes, and config edits.

## 6) Security and risk controls (parallel to development)
- Access: enforce RBAC (passenger, owner, SACCO admin, ops). Admin actions require MFA.
- Data protection: PII encrypted at rest; TLS everywhere; limit log PII.
- Fraud/risk: rate-limit USSD and API; velocity checks on payouts; dispute workflow for reversals (manual only, with ledger compensating entries).
- Business continuity: daily DB snapshots; queue-based retries for callbacks; playbooks for M-Pesa downtime.

## 7) Vendor and infrastructure choices (pragmatic defaults)
- Cloud: AWS (ECS Fargate for services, RDS Postgres, Elasticache Redis). Use S3 for logs/exports.
- Messaging: start with SNS/SQS for callbacks/notifications if Kafka is overkill; keep an internal event bus abstraction.
- SMS: Africa's Talking or Safaricom SMS. Pick one and lock the API spec.
- CI/CD: GitHub Actions building Docker images, pushing to ECR, deploying via ECS task definitions.

## 8) Pilot readiness checklist (must be green before going live)
- C2B callbacks: observed end-to-end in staging with real Safaricom sandbox; idempotency verified.
- Ledger: daily reconciliation report shows zero unexplained differences; manual journal entry procedure documented.
- USSD UX: tested on feature phones; max 6 steps for pay-fare; clear error copy for timeouts/invalid plate.
- Support: runbook for failed payouts, reversals, and customer queries; on-call rotation defined.
- Monitoring: alarms on callback failures, ledger mismatch, payout errors, and high USSD drop rate.

## 9) Go-live sequencing (week 6–7)
1. Enable production Paybill and USSD short code routing to prod endpoints behind WAF/ALB.
2. Whitelist pilot SIMs/plates/routes to limit blast radius.
3. Run live shadow mode for 3–5 days: accept fares but also run manual tally with conductors; reconcile daily.
4. Expand to full cashless on pilot route once reconciliations stay clean for 3 consecutive days.

## 10) Growth and hardening (post-pilot)
- Add vendor payments (fuel/insurance) from sub-wallets; expose APIs for partners.
- Introduce advanced risk scoring and device fingerprinting for app logins.
- Optimize costs: autoscale ECS services; move static assets to CDN; add read replicas for analytics.
- Country expansion: abstract mobile money connectors; parameterize tax and fee rules per market.

## What to avoid
- Building broad features before the fare-to-wallet flow is flawless.
- Allowing mutable ledger entries or retroactive balance edits.
- Hardcoding secrets or running prod with sandbox credentials.
- Skipping staging tests for USSD/M-Pesa flows—live debugging is slow and expensive.
- Overloading USSD menus; keep them short and test on real devices.

## Daily/weekly operating rhythm
- Daily: standup, check callback/ledger alarms, review previous day reconciliation, triage support tickets.
- Weekly: pilot KPI review (cashless adoption %, reconciliation status, USSD drop rate, payout turnaround), backlog grooming, security log review.
- Monthly: disaster-recovery drill, dependency updates, access review (IAM/users), performance test on peak-hour load.

## Single-page starter task list (first 10 actions)
1) Request Safaricom USSD + Paybill sandbox + Daraja credentials.
2) Stand up AWS accounts, VPC, RDS Postgres, Elasticache Redis, and S3 buckets; create ECR repos.
3) Set up GitHub repos with CI to build/push Docker images.
4) Implement C2B validation/confirmation endpoints with idempotency checks.
5) Implement wallet+ledger with commission and sub-wallet splits; add unit tests.
6) Build USSD pay-fare flow backed by Redis sessions; connect to C2B in sandbox.
7) Build owner dashboard cards: daily totals, balances, withdrawal request.
8) Add loyalty accrual and redemption; cap daily redemption.
9) Enable B2C payouts with OTP and approval flow in staging.
10) Run staging pilot simulation with scripted callbacks and USSD sessions; fix gaps before real pilot.
