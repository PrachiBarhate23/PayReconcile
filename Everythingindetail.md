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
| **Nginx** | Host-level reverse proxy — routes `/` to frontend container (port 3000), `/api/` to backend container (port 5000) |
| **Docker** | Containerizes both Spring Boot backend and React frontend into portable images |
| **Docker Compose** | Orchestrates all containers (backend, frontend, Redis) on production EC2 |
| **AWS ECR** | Private Docker image registry — stores `payreconcile-backend` and `payreconcile-frontend` images |
| **Terraform** | Infrastructure as Code — provisions EC2 instance, Security Groups, Elastic IP |
| **Ansible** | Configuration management — installs Docker on server, pulls ECR images, starts containers |
| **GitHub Actions** | CI/CD pipeline — build → SonarCloud → Docker build & push to ECR → Ansible deploy |
| **SonarCloud** | Static code analysis and Quality Gate enforcement |
| **Stripe CLI** | Local webhook forwarding during development |

---

## 5. Infrastructure & Architecture (Including DevOps — Detailed Workflow)

### 5.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Internet / Browser                      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP Port 80
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                AWS EC2 (Ubuntu 22.04, t3.micro)              │
│                                                              │
│  ┌────────────────────────────────────────────────────┐     │
│  │               Nginx (Host — Port 80)               │     │
│  │  /        → proxy_pass http://localhost:3000        │     │
│  │  /api/    → proxy_pass http://localhost:5000        │     │
│  └──────────┬─────────────────────────┬───────────────┘     │
│             │                         │                      │
│             ▼                         ▼                      │
│  ┌─────────────────────┐  ┌───────────────────────────┐     │
│  │  Docker Container   │  │    Docker Container       │     │
│  │  payreconcile-      │  │    payreconcile-backend   │     │
│  │  frontend           │  │    Spring Boot — Port 5000│     │
│  │  Nginx + React SPA  │  └───────────────────────────┘     │
│  │  Port 3000          │                                     │
│  └─────────────────────┘  ┌───────────────────────────┐     │
│                            │    Docker Container       │     │
│                            │    payreconcile-redis     │     │
│                            │    Redis — Port 6379      │     │
│                            └───────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        MongoDB Atlas    Stripe      Firebase/Twilio
         (Cloud DB)      API          (External)
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

**Files:** `ansible/setup_server.yml`, `ansible/deploy_app.yml`, `ansible/hosts.yml`, `ansible/templates/docker-compose.prod.yml.j2`

#### Phase 1: `setup_server.yml` — One-time server initialization (runs automatically in CI/CD)

```
Ansible connects to EC2 via SSH
     │
     ▼
Update apt package cache
     │
     ▼
Install Docker Engine + Docker Compose Plugin
     ├─ Add Docker GPG key and official repository
     ├─ apt install docker-ce, docker-ce-cli, containerd.io, docker-compose-plugin
     └─ Start and enable Docker service
     │
     ▼
Install AWS CLI (for ECR authentication)
     │
     ▼
Create directory: /opt/payreconcile
     │
     ▼
Install Nginx (host-level reverse proxy)
     │
     ▼
Configure UFW: Allow Port 80
     │
     ▼
Write Nginx config — proxy to Docker containers:
     ├─ location /        → proxy_pass http://localhost:3000 (frontend container)
     └─ location /api/   → proxy_pass http://localhost:5000 (backend container)
     │
     ▼
Restart Nginx
```

#### Phase 2: `deploy_app.yml` — Every deployment

```
Ensure /opt/payreconcile directory exists
     │
     ▼
Stop old native systemd service (ignore if not found)
     │
     ▼
Kill any Java process holding port 5000 (pkill -f java)
     │
     ▼
Force-remove backend container if stuck (docker rm -f)
     │
     ▼
Kill any remaining process on port 5000 (lsof -ti:5000 | kill -9)
     │
     ▼
Login to Amazon ECR:
     aws ecr get-login-password | docker login
     (AWS credentials injected via Ansible environment vars)
     │
     ▼
Template docker-compose.prod.yml → /opt/payreconcile/docker-compose.yml
     (Ansible fills in all secrets from GitHub Secrets via --extra-vars)
     │
     ▼
docker compose pull  → Pull latest images from ECR
     │
     ▼
docker compose up -d → Start all containers
     │
     ▼
docker image prune -f → Clean up old unused images
```

---

### 5.4 CI/CD Pipeline — GitHub Actions

**Files:** `.github/workflows/backend-deploy.yml`, `.github/workflows/frontend-deploy.yml`

**Triggers:**
- Backend: push to `main` touching `ecommerce-backend/**`
- Frontend: push to `main` touching `ecommerce-frontend/**`

#### Backend CI/CD (`backend-deploy.yml`)

```
Developer pushes code to main branch
     │
     ▼
GitHub Actions: ubuntu-latest runner
     │
     ├─ Step 1: Checkout code
     │
     ├─ Step 2: Setup JDK 17 (Temurin, Maven cache)
     │
     ├─ Step 3: Maven Build
     │           mvn clean package -DskipTests
     │           → Produces: target/app.jar (for SonarCloud)
     │
     ├─ Step 4: SonarCloud Analysis
     │           mvn sonar:sonar
     │           → Quality Gate check (continue-on-error: true)
     │
     ├─ Step 5: Configure AWS Credentials
     │           Uses AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY secrets
     │
     ├─ Step 6: Login to Amazon ECR
     │           aws-actions/amazon-ecr-login@v2
     │           → Outputs: ECR_REGISTRY (e.g. 493644445150.dkr.ecr.us-east-1.amazonaws.com)
     │
     ├─ Step 7: Docker Build & Push
     │           docker build ./ecommerce-backend
     │           docker push ECR_REGISTRY/payreconcile-backend:latest
     │           docker push ECR_REGISTRY/payreconcile-backend:<git-sha>
     │
     ├─ Step 8: Install Ansible (pip install ansible)
     │
     ├─ Step 9: Write EC2 SSH Key to ~/.ssh/payreconcile-key.pem
     │
     └─ Step 10: Run Ansible Playbooks
               ansible-playbook setup_server.yml  → Install Docker on EC2
               ansible-playbook deploy_app.yml    → Pull images & start containers
               (All secrets injected via --extra-vars)
```

#### Frontend CI/CD (`frontend-deploy.yml`)

```
Developer pushes code to main branch
     │
     ▼
     ├─ Step 1: Checkout code
     ├─ Step 2: Setup Node.js 22
     ├─ Step 3: npm install (for SonarCloud)
     ├─ Step 4: SonarCloud Analysis
     ├─ Step 5: Configure AWS Credentials
     ├─ Step 6: Login to Amazon ECR
     ├─ Step 7: Docker Build & Push
     │           docker build --build-arg VITE_API_BASE_URL=/api \
     │                        --build-arg VITE_STRIPE_PUBLISHABLE_KEY=...
     │           docker push ECR_REGISTRY/payreconcile-frontend:latest
     └─ Step 8: Run Ansible Playbooks (same as backend)
```

**GitHub Secrets used:**

| Secret | Purpose |
|---|---|
| `EC2_HOST` | EC2 Elastic IP address |
| `EC2_SSH_KEY` | Private key (.pem) for SSH/SCP access |
| `EC2_USER` | SSH username (`ubuntu`) |
| `AWS_ACCESS_KEY_ID` | AWS IAM user key — for ECR push |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM user secret — for ECR push |
| `SONAR_TOKEN` | SonarCloud authentication |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature secret (`whsec_...`) |
| `MONGODB_URI` | Full MongoDB Atlas connection string |
| `MAIL_USERNAME` | AWS SES SMTP username |
| `MAIL_PASSWORD` | AWS SES SMTP password |

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

| Enhancement | Status | Details |
|---|---|---|
| **Docker Containerization** | ✅ **DONE** | Backend and frontend fully Dockerized. Images built in GitHub Actions and pushed to AWS ECR. Containers orchestrated on EC2 via Docker Compose. Local dev supported via `docker-compose.yml`. |
| **Kubernetes (K8s) Deployment** | 🔜 Planned | Deploy to AWS EKS or self-hosted K8s. Define Deployment, Service, ConfigMap, and Secret manifests. Enable horizontal pod autoscaling (HPA) for the backend. |
| **HTTPS / SSL Certificate** | 🔜 Planned | Use AWS Certificate Manager (ACM) or Let's Encrypt (Certbot) with Nginx to enable TLS on port 443. |
| **AWS Application Load Balancer** | 🔜 Planned | Distribute traffic across multiple EC2 / pod instances. Enable health checks and auto-recovery. |

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

## 7. Docker Integration (Implemented — May 2026)

### 7.1 New Files Added

| File | Purpose |
|---|---|
| `ecommerce-backend/Dockerfile` | Multi-stage: Maven builds JAR in Stage 1, JRE-alpine runs it in Stage 2 |
| `ecommerce-backend/.dockerignore` | Excludes `target/`, `.idea/`, `deploy.zip` from Docker build context |
| `ecommerce-frontend/Dockerfile` | Multi-stage: Node builds React SPA in Stage 1, Nginx serves it in Stage 2 |
| `ecommerce-frontend/.dockerignore` | Excludes `node_modules/`, `dist/`, `.env*` |
| `ecommerce-frontend/nginx.conf` | Nginx config **inside** the frontend container — React Router SPA support, caching, security headers |
| `docker-compose.yml` | Root-level file for **local development** — runs backend, frontend, Redis together |
| `.env.example` | Template for local secrets — copy to `.env` and fill in values |
| `ansible/templates/docker-compose.prod.yml.j2` | Jinja2 template Ansible fills with secrets and deploys to EC2 |

### 7.2 Files Modified

| File | What Changed |
|---|---|
| `.github/workflows/backend-deploy.yml` | Added ECR login, Docker build & push, removed SCP/JAR copy steps |
| `.github/workflows/frontend-deploy.yml` | Added ECR login, Docker build with VITE_ build args & push |
| `ansible/setup_server.yml` | Now installs Docker + AWS CLI instead of Java. Nginx proxies to containers on :3000 and :5000 |
| `ansible/deploy_app.yml` | Replaced systemd approach with ECR pull → docker compose up |
| `.gitignore` | Added `.env` to prevent local secrets from being committed |

### 7.3 How Local Development Works Now

```bash
# 1. Copy environment template
cp .env.example .env
# 2. Fill in real values in .env

# 3. Start everything
docker compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
# Redis:    localhost:6379
```

### 7.4 How Production Deployment Works Now

```
Push to main branch
     │
     ▼
GitHub Actions builds Docker image
     │
     ▼
Pushes to AWS ECR (payreconcile-backend / payreconcile-frontend)
     │
     ▼
Ansible runs on EC2:
  1. Installs Docker (if not present)
  2. Logs into ECR using AWS credentials
  3. Writes docker-compose.yml with secrets
  4. docker compose pull → docker compose up -d
     │
     ▼
Containers running:
  ├─ payreconcile-frontend  (port 3000)
  ├─ payreconcile-backend   (port 5000)
  └─ payreconcile-redis     (internal)
     │
     ▼
Host Nginx proxies:
  /      → localhost:3000
  /api/  → localhost:5000
```

---

*Documentation generated: May 2026 | Version: 3.0.0 | Status: Production Deployed with Docker + ECR*
