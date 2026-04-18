# Payment Reconciliation System - Complete Setup Guide

## 🎯 Overview

This is an enterprise-grade Payment Reconciliation & Failure Recovery System built with:
- **Frontend**: React + TypeScript (Vite)
- **Backend**: Spring Boot 3.5.10 + MongoDB
- **Integrations**: Stripe, Twilio, Firebase, Redis, Kafka

## ✨ New Features Implemented

### 1. **Landing Page** (/landing)
- Professional landing page with feature showcase
- Sign-in/Sign-up CTAs
- Performance metrics display

### 2. **Password Reset Flow**
- Forgot password endpoint
- Email-based reset link
- Token validation
- Secure password update

### 3. **Email Notifications**
- Password reset emails
- Account confirmation
- Settlement notifications
- Chargeback alerts
- Security alerts

### 4. **SMS Notifications (Twilio)**
- Payment confirmations
- Settlement alerts
- Chargeback notifications
- Security warnings

### 5. **Push Notifications (Firebase)**
- Real-time transaction alerts
- Reconciliation updates
- Dispute notifications
- System alerts

### 6. **Redis Caching**
- High-frequency query optimization
- Automatic expiration (10 minutes)
- Configurable TTL

### 7. **Kafka Message Queue**
- Async reconciliation jobs
- Settlement processing
- Notification distribution
- Audit logging

### 8. **Settlement Reports**
- Daily/weekly settlement summaries
- Tax calculations
- Payout tracking
- Export capabilities

### 9. **Tax Calculation Module**
- Multi-country tax rates (IN, US, UK, EU, AU)
- Automatic tax record creation
- Tax liability reports
- Currency-aware calculations

### 10. **Chargeback Management**
- Initiate disputes
- Track chargeback status
- Evidence submission
- Resolution documentation

### 11. **Multi-Currency Support**
- Real-time exchange rates
- Currency conversion APIs
- 50+ supported currencies
- Automatic rate updates

### 12. **Account Balance Tracking**
- Per-user balance management
- Transaction history
- Pending settlements
- Earnings vs. payouts

### 13. **Transaction Export**
- CSV, Excel, PDF formats
- Date range filtering
- Detailed reports
- Audit trail exports

### 14. **Audit Logging**
- User activity tracking
- Entity change history
- IP address logging
- Timestamp auditing

### 15. **User Management**
- Admin user creation
- Role-based access control
- Account status management
- 2FA configuration

## 🔧 Backend Setup

### Prerequisites
```
- Java 17+
- Maven 3.8+
- MongoDB
- Redis (optional for development)
- Kafka (optional for development)
```

### 1. Update `application.properties`

Set environment variables:
```bash
# Email Configuration
export MAIL_USERNAME=your-gmail@gmail.com
export MAIL_PASSWORD=your-app-password

# Twilio Configuration
export TWILIO_ACCOUNT_SID=your-account-sid
export TWILIO_AUTH_TOKEN=your-auth-token
export TWILIO_PHONE_NUMBER=+1234567890

# Firebase Configuration
export FIREBASE_CONFIG_PATH=/path/to/serviceAccountKey.json
```

### 2. Add Firebase Service Account
1. Go to Firebase Console
2. Create/download `serviceAccountKey.json`
3. Place in project root or set `FIREBASE_CONFIG_PATH`

### 3. Configure Stripe Webhook
```
Endpoint: https://your-domain.com/api/stripe-webhook
```

### 4. Build & Run
```bash
cd ecommerce-backend
mvn clean install
mvn spring-boot:run
```

### 5. Available APIs

#### Password Reset
```
POST /api/password-reset/forgot?email=user@example.com
GET /api/password-reset/validate/{token}
POST /api/password-reset/reset/{token}
```

#### Settlements
```
GET /api/settlements
GET /api/settlements/{settlementId}
GET /api/settlements/status/{status}
GET /api/settlements/monthly/{year}/{month}
POST /api/settlements/{settlementId}/complete
```

#### Tax Records
```
POST /api/taxes/calculate?transactionId=X&orderId=Y&amount=100&country=IN
GET /api/taxes/all
GET /api/taxes/{transactionId}
GET /api/taxes/country/{country}/total
```

#### Chargebacks
```
POST /api/chargebacks/initiate?paymentId=X&orderId=Y&userId=Z&amount=100&reason=...
GET /api/chargebacks
GET /api/chargebacks/{chargebackId}
GET /api/chargebacks/status/{status}
PUT /api/chargebacks/{chargebackId}/status?status=RESOLVED
POST /api/chargebacks/{chargebackId}/evidence
```

#### Audit Logs
```
GET /api/audits
GET /api/audits/user/{userId}
GET /api/audits/entity/{entityType}/{entityId}
GET /api/audits/between?startDate=...&endDate=...
```

#### Transaction Export
```
GET /api/exports/csv?startDate=2024-01-01&endDate=2024-01-31
GET /api/exports/excel?startDate=2024-01-01&endDate=2024-01-31
GET /api/exports/pdf?startDate=2024-01-01&endDate=2024-01-31
```

#### Currency
```
GET /api/currency/convert?amount=100&fromCurrency=USD&toCurrency=INR
GET /api/currency/rate?fromCurrency=USD&toCurrency=INR
GET /api/currency/rates
```

## 🎨 Frontend Setup

### 1. Install Dependencies
```bash
cd ecommerce-frontend
npm install
```

### 2. Environment Variables
```
VITE_API_URL=http://localhost:9091/api
```

### 3. Run Development Server
```bash
npm run dev
```

Server will start at: `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
```

## 📋 New Page Routes

- `/` - Landing page
- `/login` - Login
- `/register` - Registration
- `/forgot-password` - Password recovery
- `/dashboard` - Main dashboard (protected)
- `/orders` - Order management (protected)
- `/payments` - Payment tracking (protected)
- `/ledger` - Financial ledger (protected)
- `/reconciliation` - Reconciliation engine (protected)
- `/webhooks` - Webhook logs (protected)
- `/users` - User management (protected)
- `/settlements` - Settlement reports (protected)
- `/chargebacks` - Chargeback management (protected)
- `/balance` - Account balance (protected)
- `/export` - Transaction export (protected)
- `/profile` - User profile (protected)

## 🔐 Security Features

1. **JWT Authentication**
   - Token-based auth
   - 24-hour expiration
   - Role-based access

2. **Password Security**
   - BCrypt hashing
   - Reset token validation
   - 1-hour expiration on reset links

3. **Audit Logging**
   - All user actions tracked
   - IP address logging
   - Entity change tracking

4. **CORS Protection**
   - Configured for localhost:3000
   - Disable in production & use proper CORS config

## 📊 Monitoring & Alerts

### Kafka Topics
- `reconciliation-jobs` - Async reconciliation
- `settlement-jobs` - Settlement processing
- `notifications` - Email/SMS/Push queue
- `audit-logs` - Audit trail events

### Redis Keys
- `settlement:{settlementId}` - Settlement cache
- `user:{userId}:balance` - Balance cache
- `tax:{countryCode}` - Tax rate cache
- `currency:rates` - Exchange rates cache

## 🧪 Testing

### Test Payment Flow
1. Create order: POST /api/orders
2. Check payment: GET /api/payments/{paymentId}
3. Verify ledger: GET /api/ledger
4. Test reconciliation: GET /api/reconciliation
5. Check settlement: GET /api/settlements

### Test Tax Calculation
```bash
curl -X POST http://localhost:9091/api/taxes/calculate \
  ?transactionId=TX-001 \
  &orderId=ORD-001 \
  &amount=1000 \
  &country=IN
```

### Test Currency Conversion
```bash
curl "http://localhost:9091/api/currency/convert?amount=100&fromCurrency=USD&toCurrency=INR"
```

## 📦 Production Deployment

### Docker Setup (Coming Soon)
```dockerfile
FROM openjdk:17-jdk-slim
COPY target/ecommerce-backend-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Environment Variables
- `MONGODB_URI`
- `REDIS_HOST`, `REDIS_PORT`
- `KAFKA_BOOTSTRAP_SERVERS`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `MAIL_USERNAME`, `MAIL_PASSWORD`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- `FIREBASE_CONFIG_PATH`

### Database Migration
```bash
# Create MongoDB indexes
db.users.createIndex({ "email": 1 })
db.settlements.createIndex({ "status": 1 })
db.chargebacks.createIndex({ "userId": 1 })
db.audit_logs.createIndex({ "createdAt": 1 })
```

## 🐛 Troubleshooting

### Redis Connection Failed
```bash
# Start Redis locally
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis:latest
```

### Kafka Issues
```bash
# Start Kafka locally
docker run -d -p 9092:9092 -e KAFKA_ZOOKEEPER_CONNECT=host.docker.internal:2181 confluentinc/cp-kafka:latest
```

### Email Not Sending
- Check Gmail app password (not regular password)
- Enable "Less secure apps" or use app-specific password
- Verify SMTP settings in properties

### Firebase Notifications
- Verify `serviceAccountKey.json` path
- Check Firebase Console for service account
- Test with sample device token

## 📚 API Documentation

Full OpenAPI/Swagger docs: `/api/swagger-ui.html` (coming soon)

## 🙋 Support

For issues or questions:
1. Check application logs
2. Verify environment variables
3. Test APIs with Postman
4. Check database entries

## 📝 License

Proprietary - All rights reserved

---

**Last Updated**: April 2026
**Version**: 2.0.0



. What exactly is a "Chargeback"?
Imagine a customer buys a $150 item from your platform using their credit card. A week later, they decide to call their credit card company (like Visa or MasterCard) and say, "I never bought this! It's fraud!"

The credit card company will immediately take that $150 back from your bank account by force. This forced reversal is called a Chargeback. As a business owner, chargebacks are very dangerous because you lose the product and the money. That is why your Chargeback Management Page is so important! It allows the platform administrators to instantly see disputes, upload shipping receipts as "evidence" to fight the bank, and try to win the money back.

2. What are "Settlement Reports"?
When a customer buys something on Monday with a credit card, the money does not instantly go into the business's bank account. Instead, the payment gateway (like Stripe) holds onto it. At the end of the week, Stripe takes all the thousands of tiny payments, subtracts their tax/fees, and dumps one massive payout into your actual bank account. This massive payout is called a Settlement.

Your Settlement Reports Page is where the business accountants go to see these big batch payouts. When you hit the + Demo Settlement button I just added, it pretends that Stripe just deposited $10,000 into the company bank account, giving you a beautiful financial summary of total revenue versus total taxes!