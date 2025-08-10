# AI Mind OS - Resilience & Reliability Features

## 🔄 Retry Mechanism

### Overview
The AI Mind OS platform implements comprehensive retry logic with exponential backoff to handle transient failures gracefully. This ensures reliable operation in production environments where network issues, temporary service unavailability, or rate limiting may occur.

### Retry Function (`/src/lib/utils.ts`)

```typescript
async function retry<T>(fn: () => Promise<T>, n = 3, delay = 500): Promise<T>
```

**Parameters:**
- `fn`: The async function to retry
- `n`: Maximum number of retry attempts (default: 3)
- `delay`: Base delay in milliseconds (default: 500ms)

**Backoff Strategy:**
- Exponential backoff: 500ms, 1s, 1.5s (or custom base × attempt number)
- No delay on the final attempt to fail fast

### Implementation Across APIs

#### 1. Lesson Completion API (`/api/lessons/complete`)
- **Database operations**: 3 retries, 1s base delay
- **Notifications**: 2 retries, 500ms base delay
- **N8N webhooks**: 2 retries, 1s base delay

#### 2. Stripe Webhook Handler (`/api/stripe/webhook`)
- **Database operations**: 3 retries, 500ms base delay
- **Notifications**: 2 retries, 500ms base delay
- **Idempotency checks**: 2 retries, 300ms base delay

#### 3. Health Monitoring (`/api/cron/health`)
- **Health checks**: 2 retries, 1s base delay (connection errors only)
- **KV operations**: 2 retries, 300ms base delay
- **Notifications**: 2 retries, 500ms base delay

#### 4. Notification Library (`/lib/notify.ts`)
- **Telegram API calls**: 2 retries, 500ms base delay (internal to notify functions)

---

## 🔒 Stripe Webhook Idempotency

### Overview
Stripe webhooks include built-in idempotency protection to prevent double-processing of events. This is crucial for financial operations where duplicate processing could result in incorrect billing, double notifications, or data inconsistencies.

### Implementation

#### Database Table: `stripe_events`
```sql
create table stripe_events (
    id text primary key,              -- Stripe event ID
    type text not null,               -- Event type
    payload jsonb not null,           -- Full event payload
    processed_at timestamp with time zone default now(),
    created_at timestamp with time zone default now()
);
```

#### Idempotency Flow
1. **Event Receipt**: Webhook receives Stripe event with unique ID
2. **Duplicate Check**: Query `stripe_events` table for existing event ID
3. **Early Return**: If event exists, return 200 without processing
4. **Store Event**: If new, insert event record before processing
5. **Process Event**: Continue with normal webhook logic
6. **Notification**: Alert on duplicate events (indicates potential issues)

#### Benefits
- ✅ **Prevents double-processing** of Stripe events
- ✅ **Handles webhook retries** gracefully
- ✅ **Maintains audit trail** of all processed events
- ✅ **Detects delivery issues** via duplicate notifications
- ✅ **Production-ready** financial transaction handling

---

## 🏥 Health Monitoring & Rate Limiting

### Overview
Automated health monitoring with intelligent rate-limiting prevents alert spam while ensuring critical issues are reported promptly.

### Features

#### Rate-Limited Alerts (Vercel KV)
- **Rate limit**: 15-minute cooldown between alerts
- **Graceful degradation**: Allows alerts if KV fails
- **Persistent storage**: Survives function cold starts

#### Automated Checks (Vercel Cron)
- **Schedule**: Every 5 minutes (configurable in `vercel.json`)
- **Timeout**: 10-second request timeout
- **Thresholds**: Alert if response > 5 seconds or status ≠ 200

#### Health Check Logic
```typescript
// Only retry connection errors, not slow responses
if (result.status === 0 && result.err) {
  throw new Error(`Health check failed: ${result.err}`);
}
```

---

## 🔧 Configuration Guidelines

### Retry Configuration
```typescript
// Database operations (critical)
retry(operation, 3, 500)  // 3 retries, 500ms-1.5s

// Notifications (important but not critical)
retry(notification, 2, 500)  // 2 retries, 500ms-1s

// Health checks (time-sensitive)
retry(healthCheck, 2, 1000)  // 2 retries, 1s-2s

// KV operations (fast, lightweight)
retry(kvOperation, 2, 300)  // 2 retries, 300ms-600ms
```

### Best Practices

#### 1. Selective Retries
- Only retry appropriate error types (connection errors, timeouts)
- Don't retry 4xx client errors (invalid data, auth failures)
- Be cautious with 5xx errors (may indicate server issues)

#### 2. Timeout Management
- Set appropriate timeouts for external service calls
- Use AbortController for fetch requests
- Clean up timeouts in finally blocks

#### 3. Error Handling
- Log all retry attempts for debugging
- Preserve original error information
- Provide meaningful error messages

#### 4. Monitoring
- Track retry patterns in production
- Alert on high retry rates (may indicate service issues)
- Monitor webhook duplicate event rates

---

## 🚀 Production Deployment

### Environment Setup
1. **Database Migration**: Apply `003_stripe_idempotency.sql`
2. **Environment Variables**: Ensure all service credentials are set
3. **Webhook Configuration**: Set up Stripe webhook endpoints
4. **Monitoring**: Configure Telegram notifications
5. **Cron Jobs**: Deploy Vercel cron configuration

### Testing
```bash
# Test retry functionality
curl "http://localhost:3000/api/test-retry?fail=2&succeed=true"

# Test webhook idempotency
curl -X POST "http://localhost:3000/api/stripe/webhook" \
  -H "stripe-signature: test" \
  -d '{"id":"evt_test_123","type":"checkout.session.completed"}'
```

### Monitoring Checklist
- [ ] Health check alerts are working
- [ ] Stripe events are being stored in database
- [ ] Duplicate event notifications are sent
- [ ] Retry attempts are logged
- [ ] Service dependencies are healthy

---

## 📊 Metrics & Observability

### Key Metrics to Monitor
- **Retry success rate**: Percentage of operations that succeed after retries
- **Average retry count**: How many retries are typically needed
- **Webhook duplicate rate**: Frequency of duplicate Stripe events
- **Health check response times**: Application performance trends
- **Alert frequency**: Rate of health monitoring alerts

### Logging Standards
```typescript
// Success after retries
console.log(`✅ Operation succeeded on attempt ${attemptCount}`);

// Retry attempt
console.log(`🔄 Retrying operation, attempt ${attemptCount}/${maxRetries}`);

// Idempotency
console.log(`⚠️ Duplicate event ${eventId}, skipping processing`);

// Health monitoring
console.log(`🏥 Health check: ${url} - ${status}, ${responseTime}ms`);
```

This documentation serves as a comprehensive guide for understanding and maintaining the resilience features of AI Mind OS.
