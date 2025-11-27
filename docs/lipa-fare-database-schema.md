# Lipa Fare PostgreSQL Database Schema

Beginner-friendly schema for the Lipa Fare platform. The goal is to keep names clear and show how money, vehicles, and people connect. Data types follow common PostgreSQL types.

## Conventions
- `id` fields use `uuid` (string) for uniqueness. Use `gen_random_uuid()` to generate.
- Timestamps use `timestamptz` and default to `now()`.
- Monetary amounts use `numeric(18,2)` to avoid rounding issues.
- All tables include `created_at` and `updated_at` unless noted.

## Core Identity Tables
### users
- `id` **uuid primary key**
- `phone` `varchar(20)` **unique**, required (MSISDN, e.g., +2547...)
- `email` `varchar(255)` nullable, **unique** when present
- `password_hash` `text` nullable (for channels that need passwords; USSD may be PIN-only)
- `pin_hash` `text` nullable (for USSD/app quick auth)
- `full_name` `varchar(255)`
- `role` `varchar(32)` (e.g., `passenger`, `owner`, `driver`, `sacco_admin`, `vendor_admin`, `platform_admin`)
- `status` `varchar(24)` default `active` (e.g., `active`, `blocked`, `pending_kyc`)
- `last_login_at` `timestamptz` nullable
- `created_at` `timestamptz` default `now()`
- `updated_at` `timestamptz` default `now()`

### sacco
- `id` **uuid primary key**
- `name` `varchar(255)` **unique**
- `registration_number` `varchar(64)` **unique** (official SACCO registration)
- `contact_phone` `varchar(20)`
- `contact_email` `varchar(255)` nullable
- `status` `varchar(24)` default `active`
- `created_at`, `updated_at`

### sacco_memberships
Links users to SACCOS with roles/permissions.
- `id` **uuid primary key**
- `user_id` **uuid**, references `users(id)`
- `sacco_id` **uuid**, references `sacco(id)`
- `role` `varchar(32)` (e.g., `owner`, `driver`, `admin`)
- `status` `varchar(24)` default `active`
- `created_at`, `updated_at`
- **Unique** on (`user_id`, `sacco_id`, `role`)

## Vehicles and Ownership
### owners
Captures business/individual owners for payouts and KYC.
- `id` **uuid primary key**
- `user_id` **uuid**, references `users(id)`
- `national_id` `varchar(32)` **unique** nullable
- `kra_pin` `varchar(32)` nullable
- `payout_channel` `varchar(32)` (e.g., `mpesa`, `bank`)
- `payout_account` `varchar(64)` (phone for M-Pesa, account number for bank)
- `created_at`, `updated_at`

### vehicles
- `id` **uuid primary key**
- `plate_number` `varchar(16)` **unique**
- `type` `varchar(24)` (e.g., `psv`, `boda`)
- `owner_id` **uuid**, references `owners(id)`
- `sacco_id` **uuid** nullable, references `sacco(id)`
- `route_name` `varchar(128)` nullable
- `fare_default` `numeric(10,2)` nullable (typical fare for suggestions)
- `status` `varchar(24)` default `active`
- `created_at`, `updated_at`

### vehicle_drivers
Allows multiple drivers per vehicle over time.
- `id` **uuid primary key**
- `vehicle_id` **uuid**, references `vehicles(id)`
- `user_id` **uuid**, references `users(id)` (driver)
- `assigned_from` `date`
- `assigned_to` `date` nullable
- `status` `varchar(24)` default `active`
- `created_at`, `updated_at`
- **Unique** on (`vehicle_id`, `user_id`, `assigned_from`)

### vendor_partners
Fuel stations, insurance, spares, etc.
- `id` **uuid primary key**
- `name` `varchar(255)`
- `category` `varchar(32)` (e.g., `fuel`, `insurance`, `spares`)
- `paybill` `varchar(32)` nullable
- `till_number` `varchar(32)` nullable
- `contact_phone` `varchar(20)` nullable
- `status` `varchar(24)` default `active`
- `created_at`, `updated_at`

## Wallets and Accounts
### wallets
One wallet per vehicle or owner (depending on configuration).
- `id` **uuid primary key**
- `owner_id` **uuid**, references `owners(id)`
- `vehicle_id` **uuid** nullable, references `vehicles(id)` (set when wallet is tied to a vehicle)
- `currency` `varchar(8)` default `KES`
- `balance` `numeric(18,2)` default `0`
- `status` `varchar(24)` default `active`
- `created_at`, `updated_at`
- **Unique** on (`owner_id`, `vehicle_id`) to avoid duplicates

### sub_wallets
Virtual accounts for automated splits.
- `id` **uuid primary key**
- `wallet_id` **uuid**, references `wallets(id)`
- `name` `varchar(64)` (e.g., `fuel`, `maintenance`, `insurance`, `loan`, `sacco`, `profit`)
- `percentage` `numeric(5,2)` (e.g., 10.00 = 10%)
- `balance` `numeric(18,2)` default `0`
- `status` `varchar(24)` default `active`
- `created_at`, `updated_at`
- **Unique** on (`wallet_id`, `name`)

## Ledger and Transactions
### transactions
Immutable record of every money movement (double-entry friendly when paired with `transaction_entries`).
- `id` **uuid primary key**
- `external_ref` `varchar(128)` nullable (e.g., M-Pesa receipt)
- `type` `varchar(32)` (e.g., `fare_payment`, `commission`, `payout_mpesa`, `payout_bank`, `loyalty_award`, `loyalty_redeem`)
- `channel` `varchar(32)` nullable (e.g., `ussd`, `app`, `mpesa_c2b`, `mpesa_b2c`)
- `amount` `numeric(18,2)` **positive amount for the transaction**
- `currency` `varchar(8)` default `KES`
- `vehicle_id` **uuid** nullable, references `vehicles(id)`
- `owner_id` **uuid** nullable, references `owners(id)`
- `passenger_user_id` **uuid** nullable, references `users(id)`
- `status` `varchar(24)` default `pending` (e.g., `pending`, `successful`, `failed`, `reversed`)
- `occurred_at` `timestamptz` default `now()`
- `created_at`, `updated_at`

### transaction_entries
Supports double-entry accounting (credits & debits that balance to zero per transaction).
- `id` **uuid primary key**
- `transaction_id` **uuid**, references `transactions(id)`
- `wallet_id` **uuid** nullable, references `wallets(id)` (for platform or owner wallet)
- `sub_wallet_id` **uuid** nullable, references `sub_wallets(id)`
- `direction` `varchar(6)` (`debit` or `credit`)
- `amount` `numeric(18,2)`
- `currency` `varchar(8)` default `KES`
- `note` `varchar(255)` nullable
- `created_at`, `updated_at`
- **Check**: sum of credits = sum of debits for each `transaction_id`

## Loyalty
### loyalty_accounts
- `id` **uuid primary key**
- `user_id` **uuid**, references `users(id)`
- `points_balance` `numeric(18,2)` default `0`
- `status` `varchar(24)` default `active`
- `created_at`, `updated_at`
- **Unique** on (`user_id`)

### loyalty_transactions
- `id` **uuid primary key**
- `loyalty_account_id` **uuid**, references `loyalty_accounts(id)`
- `transaction_id` **uuid** nullable, references `transactions(id)` (links to fare when points awarded or redeemed)
- `type` `varchar(32)` (`earn`, `redeem`, `adjust`)
- `points` `numeric(18,2)` (positive for earn, negative for redeem)
- `description` `varchar(255)` nullable
- `occurred_at` `timestamptz` default `now()`
- `created_at`, `updated_at`

## USSD Sessions
### ussd_sessions
Simple state store for active flows.
- `id` **uuid primary key**
- `session_id` `varchar(64)` **unique** (from telco)
- `phone` `varchar(20)`
- `user_id` **uuid** nullable, references `users(id)`
- `state` `jsonb` (menu state, temporary inputs)
- `expires_at` `timestamptz`
- `created_at`, `updated_at`

## Vendor Payments
### vendor_transactions
Records payments from wallets to vendor partners (fuel, insurance, etc.).
- `id` **uuid primary key**
- `vendor_id` **uuid**, references `vendor_partners(id)`
- `wallet_id` **uuid**, references `wallets(id)`
- `sub_wallet_id` **uuid** nullable, references `sub_wallets(id)`
- `transaction_id` **uuid** nullable, references `transactions(id)` (ledger link)
- `amount` `numeric(18,2)`
- `currency` `varchar(8)` default `KES`
- `status` `varchar(24)` default `pending`
- `note` `varchar(255)` nullable
- `created_at`, `updated_at`

## Settings and Percentages
### vehicle_split_rules
Allows different split percentages per vehicle (overrides defaults).
- `id` **uuid primary key**
- `vehicle_id` **uuid**, references `vehicles(id)`
- `sub_wallet_id` **uuid**, references `sub_wallets(id)`
- `percentage` `numeric(5,2)` (0-100)
- `effective_from` `date` default current_date
- `effective_to` `date` nullable
- `created_at`, `updated_at`
- **Unique** on (`vehicle_id`, `sub_wallet_id`, `effective_from`)

## Audit and Security
### audit_logs
Tracks critical actions for compliance.
- `id` **uuid primary key**
- `user_id` **uuid** nullable, references `users(id)`
- `action` `varchar(64)` (e.g., `login`, `create_vehicle`, `payout_request`, `reverse_transaction`)
- `entity_type` `varchar(64)` nullable (e.g., `vehicle`, `transaction`, `wallet`)
- `entity_id` `uuid` nullable
- `metadata` `jsonb` nullable
- `created_at` `timestamptz` default `now()`

## Minimal Indices
- `users(phone)` unique
- `users(email)` unique
- `vehicles(plate_number)` unique
- `transactions(external_ref)` index
- `transactions(vehicle_id, occurred_at)` index for reporting
- `transaction_entries(transaction_id)` index
- `loyalty_accounts(user_id)` unique
- `ussd_sessions(session_id)` unique

## How the pieces connect (in plain language)
1. A passenger pays fare via M-Pesa (C2B). The payment creates a `transactions` row with type `fare_payment` plus matching `transaction_entries` to credit the platform and debit the payment channel. The system then splits the fare into `sub_wallets` based on percentages.
2. The passenger earns points: add a row to `loyalty_transactions` and update `loyalty_accounts` balance.
3. Owners view balances in `wallets` and `sub_wallets`. When they request a payout (B2C/B2B), a `transactions` row (type `payout_mpesa` or `payout_bank`) is created with entries moving funds out.
4. Vendor payments (fuel, insurance) use `vendor_transactions` tied to the ledger for traceability.
5. USSD sessions store temporary flow data so the user can step through menus safely within telco timeouts.
6. SACCO admins manage vehicles and drivers through `sacco_memberships`, while audit logs record important changes and access.
