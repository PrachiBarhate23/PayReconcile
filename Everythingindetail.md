# PayReconcile — Complete Project Documentation

> **Transaction Reconciliation & Auto-Refund System**  
> A production-style payment integrity and reconciliation engine built with Spring Boot, MongoDB, Stripe, and React.

---

## 1. Problem Statement

### The Real-World Problem

In modern e-commerce and fintech systems, **payment and order processing happen across separate services**. This distributed nature introduces a critical class of bugs — **payment-order mismatches** — which cause serious financial and trust issues.

#### What Goes Wrong in a Typical System

| Scenario | What Happens | Customer Experience |
|---|---|---|
| Payment succeeds, order service crashes | Money captured, no order created | Customer charged, nothing delivered |
| Payment fails, order still marked PAID | Order ships without payment | Revenue loss |
| Webhook received twice | Order marked PAID twice, ledger double-credited | Financial inconsistency |
| No audit trail | Can't trace what went wrong | Compliance failure |

#### Why Existing Systems Fail

- Payment gateway (Stripe/Razorpay) and Order Service are **completely decoupled**
- No **automatic reconciliation layer** between them
- Mismatches are resolved **manually by support teams** — taking 3–5 business days
- Customers must **contact support** to get refunds for failed orders
- **No financial audit log** to trace what changed and when

#### The Core Gap

> Most student and small-scale e-commerce projects implement only:  
> **"Payment successful → Order created"**  
>
> But they never answer:  
> **"What if payment succeeds but the order fails?"**  
> **"What if the webhook fires twice?"**  
> **"Who authorized that refund and when?"**

This is the exact gap PayReconcile solves.

---

## 2. Features — My Solution

PayReconcile is not a CRUD app. It is a **simplified fintech settlement system** that brings enterprise-grade payment consistency to a full-stack project.

### 🔐 Authentication & Security

| Feature | Description |
|---|---|
| **JWT Authentication** | Stateless token-based auth using `jjwt`. Every request requires a valid Bearer token. |
| **Role-Based Access Control (RBAC)** | `ADMIN` and `USER` roles. Admin-only endpoints are protected with `@PreAuthorize("hasRole('ADMIN')")`. |
| **Stripe Webhook Signature Verification** | Every incoming Stripe event is verified using `Stripe-Signature` header and `whsec_` secret. |
| **Idempotent Webhook Processing** | Each Stripe event ID is stored. If re-received, it is marked `IGNORED` to prevent double-processing. |
| **Password Reset Flow** | Email-based token (UUID, 1-hour TTL) stored in `password_resets` collection. |

### 💳 Core Payment Features

| Feature | Description |
|---|---|
| **Stripe PaymentIntent Integration** | Creates a PaymentIntent server-side; returns `clientSecret` to frontend for Stripe Elements. |
| **Stripe Webhook Handler** | Listens to `payment_intent.succeeded` and `payment_intent.payment_failed` events. |
| **Retry Failed Payments** | Users can retry payments on FAILED orders through a dedicated retry endpoint. |
| **Automatic Refund Trigger** | When reconciliation detects `Payment=SUCCESS` but `Order=FAILED`, a Stripe refund is issued via API automatically. |

### 📒 Ledger System

| Feature | Description |
|---|---|
| **CREDIT Entry** | Created when `payment_intent.succeeded` webhook is received. |
| **DEBIT Entry** | Created when a refund is triggered by the reconciliation engine. |
| **Append-Only Design** | Ledger entries are never deleted or modified — full financial audit trail maintained. |
| **Per-User Ledger View** | Users see only their own entries; Admins see the global ledger. |

### 🔍 Reconciliation Engine

| Feature | Description |
|---|---|
| **Mismatch Detection** | Scans all orders and cross-checks with corresponding payment records. |
| **Auto-Correction** | Detects `Payment=SUCCESS + Order=FAILED` → triggers refund → marks order `REFUNDED`. |
| **Reverse Mismatch Fix** | Detects `Payment=FAILED + Order=PAID` → corrects order status to `FAILED`. |
| **Mismatch Logging** | Every detected mismatch is persisted as a `ReconciliationMismatch` document. |
| **Admin-Only Trigger** | `POST /api/reconciliation/run` is restricted to `ADMIN` role only. |

### 📊 Settlement & Financial Reports

| Feature | Description |
|---|---|
| **Settlement Reports** | Group transactions by daily/weekly periods. Track `totalAmount`, `taxAmount`, `netAmount`. |
| **Tax Calculation** | Multi-country support: India (GST 18%), US (Sales Tax 8.5%), UK (VAT 20%), EU (VAT 19%), Australia (GST 10%). |
| **Multi-Currency Support** | Convert between USD, EUR, INR, GBP, AUD, CAD, JPY, CNY. |
| **Account Balance Tracking** | Per-user `accountBalance`, `totalEarnings`, `totalPayouts`, `pendingBalance`. |
| **Transaction Export** | Download transaction history as CSV, Excel (.xlsx), or PDF with charts. |

### ⚠️ Dispute Management

| Feature | Description |
|---|---|
| **Chargeback Initiation** | Users can raise chargebacks via `POST /api/chargebacks/initiate`. |
| **Evidence Submission** | Evidence documents can be attached to an active chargeback. |
| **Status Lifecycle** | `INITIATED → UNDER_REVIEW → RESOLVED / WON / LOST` |
| **Auto Notifications** | Email + SMS sent on every status change of a chargeback. |

### 🔔 Notification System

| Channel | Provider | Triggers |
|---|---|---|
| **Email** | Spring Mail (Gmail SMTP) | Password reset, settlement complete, chargeback updates, transaction failures |
| **SMS** | Twilio | Payment confirmations, settlement alerts, chargeback notifications, security warnings |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Payment updates, reconciliation alerts, chargeback initiated, security events |

### 📋 Audit Logging

Every user action is captured with: `userId`, `action`, `entityType`, `entityId`, `ipAddress`, `userAgent`, `timestamp`, `status`. Events are also published to a **Kafka `audit-logs` topic**.

### 🎛️ Admin Dashboard

- View all orders, payments, and ledger entries across all users
- Trigger manual reconciliation
- View all Stripe webhook logs with `PROCESSED` / `IGNORED` status
- Monitor system-wide mismatches and recovery actions
- Manage users (create, edit, deactivate, assign roles)

---

## 3. Workflow

### 3.1 Normal Payment Success Flow

```
User creates Order
        │
        ▼
Frontend calls POST /api/payments/create-intent
        │
        ▼
Backend creates Stripe PaymentIntent → returns clientSecret
        │
        ▼
User enters card details in Stripe Elements (React)
        │
        ▼
Stripe confirms payment on its side
        │
        ▼
Stripe sends webhook → POST /api/webhook/stripe
        │
        ├─ Verify Stripe-Signature header
        ├─ Check idempotency (has event ID been seen before?)
        ├─ Event: payment_intent.succeeded
        │       ├─ Update Payment status → SUCCESS
        │       ├─ Update Order status → PAID
        │       ├─ Create Ledger CREDIT entry
        │       └─ Log webhook as PROCESSED
        │
        ▼
User sees Order = PAID, Ledger updated, Dashboard reflects new state
```

### 3.2 Failed Payment Flow

```
User enters failing card (e.g., 4000 0000 0000 0002)
        │
        ▼
Stripe sends webhook: payment_intent.payment_failed
        │
        ├─ Update Payment status → FAILED
        ├─ Update Order status → FAILED
        └─ Log webhook as PROCESSED

No Ledger entry created.
User can retry payment from OrdersPage.
```

### 3.3 Auto-Refund via Reconciliation (Core Feature)

```
Admin clicks "Run Reconciliation" on Dashboard
        │
        ▼
POST /api/reconciliation/run  (ADMIN only)
        │
        ▼
ReconciliationService scans all Orders
        │
        ▼
For each Order where Payment=SUCCESS but Order=FAILED:
        ├─ Call Stripe API → Issue Refund
        ├─ Update Payment status → REFUNDED
        ├─ Update Order status → REFUNDED
        ├─ Create Ledger DEBIT entry
        └─ Persist ReconciliationMismatch log

For each Order where Payment=FAILED but Order=PAID:
        ├─ Correct Order status → FAILED
        └─ Persist ReconciliationMismatch log

Admin sees mismatch list at GET /api/reconciliation/mismatches
```

### 3.4 Chargeback Workflow

```
User raises chargeback → POST /api/chargebacks/initiate
        │
        ▼
Status = INITIATED
Email + SMS sent to user
        │
        ▼
Admin reviews → PUT /api/chargebacks/{id}/status (UNDER_REVIEW)
        │
        ▼
User submits evidence → POST /api/chargebacks/{id}/evidence
        │
        ▼
Admin resolves → Status: RESOLVED / WON / LOST
Email + SMS notification sent on resolution
```

### 3.5 Authentication Flow

```
User registers → POST /api/auth/register
        │
        ▼
Password hashed with BCrypt → stored in MongoDB users collection

User logs in → POST /api/auth/login
        │
        ▼
Credentials verified → JWT generated (signed with secret key)
        │
        ▼
JWT returned to frontend → stored in localStorage
        │
        ▼
Every subsequent request:
  axios interceptor reads token from localStorage
  Adds header: Authorization: Bearer <token>
        │
        ▼
JwtFilter (Spring Security) validates token on every request
Extracts username + roles → sets SecurityContext
```

---

## 4. Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Java** | 17 | Core language |
| **Spring Boot** | 3.5.10 | Application framework |
| **Spring Security** | (bundled) | JWT authentication, RBAC, endpoint protection |
| **Spring Data MongoDB** | (bundled) | ODM layer for MongoDB |
| **Spring Kafka** | (bundled) | Async event streaming (reconciliation, audit, notifications) |
| **Spring Mail** | (bundled) | Email via Gmail SMTP |
| **Spring Data Redis** | (bundled) | Caching layer |
| **Jedis** | (bundled) | Redis client |
| **jjwt** | 0.11.5 | JWT creation and validation |
| **Stripe Java SDK** | 24.14.0 | Payment Intents, Refunds, Webhook verification |
| **Razorpay Java SDK** | 1.4.3 | Alternative payment gateway integration |
| **Twilio** | (via REST) | SMS notifications |
| **Firebase Admin SDK** | 9.2.0 | Push notifications (FCM) |
| **Apache POI** | 5.2.4 | Excel (.xlsx) export |
| **iTextPDF** | 5.5.13.3 | PDF report generation |
| **Lombok** | (bundled) | Boilerplate reduction (@Data, @Builder, @RequiredArgsConstructor) |
| **Gson** | 2.10.1 | JSON serialization |
| **AWS SDK SNS** | 2.20.162 | SMS via AWS SNS (alternative channel) |
| **MongoDB Atlas** | Cloud | Database hosting |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18+ | UI framework |
| **TypeScript** | 5+ | Type-safe frontend code |
| **Vite** | 5+ | Build tool and dev server |
| **Axios** | (npm) | HTTP client with JWT interceptor |
| **Stripe.js / React Stripe** | (npm) | Stripe Elements — card input UI |
| **Tailwind CSS** | 3+ | Utility-first styling |
| **React Router DOM** | 6+ | Client-side routing |

### DevOps & Infrastructure

| Tool | Purpose |
|---|---|
| **AWS EC2 (t3.micro)** | Production server (Ubuntu 22.04) |
| **AWS Elastic IP** | Static public IP for EC2 instance |
| **Nginx** | Reverse proxy — serves React frontend on port 80, proxies `/api` to backend on port 5000 |
| **Systemd** | Manages Spring Boot JAR as a long-running background service (`payreconcile.service`) |
| **Terraform** | Infrastructure as Code — provisions EC2 instance, Security Groups, Elastic IP |
| **Ansible** | Configuration management — server setup (Java, Nginx, directories), app deployment |
| **GitHub Actions** | CI/CD pipeline — build → test → SonarCloud analysis → deploy |
| **SonarCloud** | Static code analysis and Quality Gate enforcement |
| **Stripe CLI** | Local webhook forwarding during development |

---

## 5. Infrastructure & Architecture (Including DevOps — Detailed Workflow)

### 5.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Internet / Browser                │
└────────────────────────┬────────────────────────────┘
                         │ HTTP Port 80
                         ▼
┌─────────────────────────────────────────────────────┐
│              AWS EC2 (Ubuntu 22.04, t3.micro)        │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │                    Nginx                     │   │
│  │  Port 80 → /          → React Static Files   │   │
│  │  Port 80 → /api/      → localhost:5000        │   │
│  └─────────────────────────┬────────────────────┘   │
│                            │ proxy_pass               │
│                            ▼                         │
│  ┌─────────────────────────────────────────────┐    │
│  │   Spring Boot JAR (payreconcile.service)    │    │
│  │   Managed by Systemd — Port 5000            │    │
│  └─────────────────────┬───────────────────────┘    │
│                        │                             │
└────────────────────────┼─────────────────────────────┘
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
        MongoDB       Stripe    Firebase/Twilio
         Atlas         API        (External)
```

**Same-Origin Architecture**: By serving both React frontend and Spring Boot backend from the same EC2 IP address through Nginx, CORS issues are completely eliminated. The frontend calls `/api/...` which Nginx transparently proxies to the backend.

---

### 5.2 Infrastructure Provisioning — Terraform

**Files:** `terraform/main.tf`, `terraform/ec2.tf`

Terraform provisions the entire AWS infrastructure declaratively:

```
terraform apply
     │
     ▼
Create Security Group: payreconcile-sg
     ├─ Inbound: Port 22 (SSH)
     ├─ Inbound: Port 80 (HTTP)
     ├─ Inbound: Port 443 (HTTPS)
     ├─ Inbound: Port 5000 (Backend direct access, dev)
     └─ Outbound: All traffic allowed
     │
     ▼
Lookup latest Ubuntu 22.04 AMI (Canonical official)
     │
     ▼
Create EC2 Instance: t3.micro
     ├─ ami = Ubuntu 22.04 LTS
     ├─ key_name = payreconcile-key
     └─ vpc_security_group_ids = [payreconcile-sg]
     │
     ▼
Allocate Elastic IP → Attach to EC2 instance
     │
     ▼
Output: public_ip (static, survives reboots)
```

**State** is tracked in `terraform.tfstate` — changes are incremental and safe.

---

### 5.3 Server Configuration — Ansible

**Files:** `ansible/setup_server.yml`, `ansible/deploy_app.yml`, `ansible/hosts.yml`, `ansible/templates/payreconcile.service.j2`

#### Phase 1: `setup_server.yml` — One-time server initialization

```
Ansible connects to EC2 via SSH
     │
     ▼
Update apt package cache
     │
     ▼
Install OpenJDK 17
     │
     ▼
Install Nginx
     │
     ▼
Create directories:
     ├─ /opt/payreconcile/backend   (Spring Boot JAR lives here)
     └─ /var/www/payreconcile        (React build lives here)
     │
     ▼
Configure UFW Firewall:
     ├─ Allow Port 80 (HTTP)
     └─ Allow Port 5000 (Backend)
     │
     ▼
Write Nginx config to /etc/nginx/sites-available/default:
     ├─ Serve React static files from /var/www/payreconcile
     ├─ SPA fallback: try_files → index.html
     └─ Proxy /api/* → http://localhost:5000
     │
     ▼
Write Systemd service file (payreconcile.service):
     ├─ ExecStart = java -jar /opt/payreconcile/backend/app.jar
     ├─ Inject environment variables (Stripe keys, MongoDB URI, JWT secret)
     ├─ Restart = always
     └─ WantedBy = multi-user.target
     │
     ▼
Reload Systemd → Restart Nginx
```

#### Phase 2: `deploy_app.yml` — Every deployment

```
Stop payreconcile systemd service
     │
     ▼
Write updated payreconcile.service template
(injects latest env vars from GitHub Secrets via --extra-vars)
     │
     ▼
Reload Systemd daemon
     │
     ▼
Start payreconcile service
     │
     ▼
Service restarts with new JAR + updated config
```

---

### 5.4 CI/CD Pipeline — GitHub Actions

**File:** `.github/workflows/backend-deploy.yml`

**Trigger:** Any push to the `main` branch that touches files in `ecommerce-backend/**`

```
Developer pushes code to main branch
     │
     ▼
GitHub Actions: ubuntu-latest runner
     │
     ├─ Step 1: Checkout code (actions/checkout@v4)
     │
     ├─ Step 2: Setup JDK 17 (Temurin distribution, Maven cache)
     │
     ├─ Step 3: SSH into EC2 → Create /opt/payreconcile/backend directory
     │           (ensures directory exists before file copy)
     │
     ├─ Step 4: Maven Build
     │           cd ecommerce-backend
     │           mvn clean package -DskipTests
     │           → Produces: target/app.jar
     │
     ├─ Step 5: SonarCloud Analysis
     │           mvn sonar:sonar
     │           -Dsonar.projectKey=PayReconcile
     │           -Dsonar.organization=prachiBarhate23
     │           → Quality Gate check (continue-on-error: true)
     │
     ├─ Step 6: Prepare Staging Area
     │           mkdir staging/
     │           cp target/app.jar staging/
     │           echo "$APP_PROPS" > staging/application.properties
     │           (application.properties injected from GitHub Secret)
     │
     ├─ Step 7: SCP files to EC2
     │           appleboy/scp-action
     │           → Copies staging/* → /opt/payreconcile/backend/
     │
     ├─ Step 8: Setup Ansible SSH Key
     │           Write EC2_SSH_KEY secret to ~/.ssh/payreconcile-key.pem
     │           chmod 600
     │
     └─ Step 9: Run Ansible Deploy Playbook
               cd ansible
               ansible-playbook -i hosts.yml deploy_app.yml \
                 --extra-vars "ec2_ip=... stripe_secret=... stripe_publishable=..."
               → Ansible stops, updates, and restarts payreconcile.service on EC2
```

**GitHub Secrets used:**

| Secret | Purpose |
|---|---|
| `EC2_HOST` | EC2 Elastic IP address |
| `EC2_SSH_KEY` | Private key (.pem) for SSH/SCP access |
| `SONAR_TOKEN` | SonarCloud authentication |
| `APPLICATION_PROPERTIES` | Full `application.properties` file content with all secrets |
| `STRIPE_SECRET_KEY` | Stripe secret key (injected as Ansible extra-var) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |

---

### 5.5 MongoDB Collections & Schema

| Collection | Purpose |
|---|---|
| `users` | User accounts — username, email, password (BCrypt), roles, accountBalance, preferredCurrency, twoFactorEnabled |
| `orders` | Order records — orderId, userId, amount, status (PENDING/PAID/FAILED/REFUNDED) |
| `payments` | Payment records — paymentIntentId, orderId, status, stripeChargeId |
| `ledger_entries` | Append-only — type (CREDIT/DEBIT), amount, orderId, userId, timestamp |
| `webhook_logs` | Stripe event logs — eventId, eventType, status (PROCESSED/IGNORED), receivedAt |
| `reconciliation_mismatches` | Mismatch records — orderId, paymentStatus, orderStatus, action taken, timestamp |
| `password_resets` | Reset tokens — userId, email, UUID token, expiresAt, isUsed |
| `settlements` | Settlement batches — date range, totalAmount, taxAmount, netAmount, status |
| `tax_records` | Per-transaction tax — taxableAmount, taxRate, taxType, country |
| `chargebacks` | Dispute records — status, evidence, resolution, timestamps |
| `audit_logs` | User action trail — userId, action, entityType, entityId, IP, userAgent |

---

### 5.6 Redis Caching Layer

Spring Boot is configured with Redis caching to reduce repeated database hits:

| Cache Key | TTL | Cached Data |
|---|---|---|
| `settlement:{id}` | 10 min | Settlement detail |
| `user:{id}:balance` | 10 min | User account balance |
| `tax:{countryCode}` | 10 min | Tax rate for country |
| `currency:rates` | 10 min | All exchange rates |
| `payment:{id}` | 10 min | Payment record |

---

### 5.7 Kafka Message Queue

Asynchronous processing via Kafka topics:

| Topic | Partitions | Consumers |
|---|---|---|
| `reconciliation-jobs` | 3 | Reconciliation workers |
| `settlement-jobs` | 2 | Settlement processor |
| `notifications` | 2 | Email / SMS / Push dispatcher |
| `audit-logs` | 1 | Audit log writer |

---

### 5.8 Security Architecture

```
Request arrives at Spring Boot
     │
     ▼
JwtFilter (OncePerRequestFilter):
     ├─ Extract Authorization: Bearer <token> header
     ├─ Validate JWT signature (HMAC-SHA256)
     ├─ Extract username + roles from claims
     └─ Set Authentication in SecurityContextHolder
     │
     ▼
Spring Security checks @PreAuthorize annotations
     ├─ ADMIN endpoints: hasRole('ADMIN')
     └─ USER endpoints: hasRole('USER') or authenticated()
     │
     ▼
Business logic executes
```

**Webhook Security** (separate flow):
```
POST /api/webhook/stripe (public — no JWT)
     │
     ▼
Read Stripe-Signature header
     │
     ▼
Stripe.constructEvent(payload, sigHeader, webhookSecret)
     ├─ Valid → process event
     └─ Invalid → 400 Bad Request (reject)
     │
     ▼
Check idempotency: has this eventId been processed?
     ├─ Yes → mark IGNORED, return 200
     └─ No  → process and mark PROCESSED
```

---

## 6. Future Scope

### Phase 1 — Infrastructure Hardening

| Enhancement | Details |
|---|---|
| **Docker Containerization** | Dockerize Spring Boot backend and React frontend. Create `docker-compose.yml` for local full-stack development with MongoDB, Redis, Kafka all in containers. |
| **Kubernetes (K8s) Deployment** | Deploy to AWS EKS or self-hosted K8s. Define Deployment, Service, ConfigMap, and Secret manifests. Enable horizontal pod autoscaling (HPA) for the backend. |
| **HTTPS / SSL Certificate** | Use AWS Certificate Manager (ACM) or Let's Encrypt (Certbot) with Nginx to enable TLS on port 443. |
| **AWS Application Load Balancer** | Distribute traffic across multiple EC2 / pod instances. Enable health checks and auto-recovery. |

### Phase 2 — Observability & Monitoring

| Enhancement | Details |
|---|---|
| **ELK Stack** | Elasticsearch + Logstash + Kibana for centralized log management and search. |
| **Prometheus + Grafana** | Expose Spring Boot Actuator metrics. Scrape with Prometheus. Visualize in Grafana dashboards — JVM metrics, request latency, error rates. |
| **Distributed Tracing** | Integrate Zipkin or Jaeger for request tracing across services. |
| **Alerting** | PagerDuty or AWS CloudWatch Alarms for critical failures (reconciliation errors, payment failures above threshold). |

### Phase 3 — Architecture Evolution

| Enhancement | Details |
|---|---|
| **Microservices Split** | Split the monolith into dedicated services: OrderService, PaymentService, LedgerService, ReconciliationService, NotificationService. Each with its own MongoDB collection and Kafka topics for communication. |
| **Redis for Idempotency** | Move webhook idempotency from MongoDB to Redis (SET NX with TTL) for sub-millisecond deduplication at scale. |
| **Kafka Streams for Real-Time Reconciliation** | Replace polling-based reconciliation with event-driven streaming. Mismatches detected in real-time as payment and order events flow through Kafka. |
| **GraphQL API** | Expose a GraphQL endpoint alongside REST for flexible frontend data fetching, especially for the admin dashboard with complex queries. |

### Phase 4 — Product Features

| Enhancement | Details |
|---|---|
| **Two-Factor Authentication (2FA)** | TOTP-based 2FA using Google Authenticator. `twoFactorEnabled` field already exists in the User model. |
| **Webhook Retry Mechanism** | If webhook processing fails, re-queue on Kafka with exponential backoff instead of losing the event. |
| **Subscription / Recurring Payments** | Stripe Subscriptions integration for SaaS-style recurring billing with automatic renewal and cancellation flows. |
| **Real Exchange Rates** | Replace mock currency conversion with a live exchange rate API (e.g., Open Exchange Rates or Fixer.io). |
| **API Rate Limiting** | Spring Cloud Gateway or Bucket4j for per-user/per-IP rate limiting on sensitive endpoints. |
| **Swagger / OpenAPI Docs** | Auto-generate interactive API documentation using `springdoc-openapi` — browsable at `/swagger-ui.html`. |
| **Frontend Testing** | Jest unit tests + React Testing Library for component testing. Cypress E2E tests for full payment flow automation. |

### Phase 5 — Scale & Compliance

| Enhancement | Details |
|---|---|
| **PCI DSS Compliance Review** | Audit the payment flow against PCI DSS standards. Ensure no raw card data ever touches the backend (Stripe Elements already handles this). |
| **GDPR Data Handling** | Implement data export (right to access) and deletion (right to be forgotten) endpoints for user data. |
| **Multi-Tenant Architecture** | Support multiple merchant accounts, each with their own isolated orders, payments, ledger, and settlements. |
| **Load Testing** | K6 or Apache JMeter load tests to validate performance under 1000+ concurrent payment webhooks. |

---

*Documentation generated: May 2026 | Version: 2.0.0 | Status: Production Deployed*
