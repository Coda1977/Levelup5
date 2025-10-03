# Performance Testing Guide

**Last Updated:** 2025-10-03  
**Status:** Ready for execution  
**Tool:** Grafana K6

---

## 🎯 **Overview**

This document outlines the performance testing strategy for LevelUp5, including test scenarios, targets, and optimization recommendations.

---

## 📊 **Performance Targets**

### **Response Time Targets**

| Metric | Excellent | Good | Acceptable | Poor |
|--------|-----------|------|------------|------|
| **Landing Page** | < 1s | < 1.5s | < 2s | > 2s |
| **Learn Page** | < 1.5s | < 2s | < 3s | > 3s |
| **Chapter Page** | < 2s | < 3s | < 4s | > 4s |
| **Chat Page** | < 1s | < 1.5s | < 2s | > 2s |
| **API Endpoints** | < 200ms | < 500ms | < 1s | > 1s |
| **AI Chat Response** | < 5s | < 10s | < 15s | > 15s |

### **Concurrent User Targets**

| Level | Users | Expected Performance |
|-------|-------|---------------------|
| **Minimum** | 50 | All targets met |
| **Target** | 100 | 95% targets met |
| **Stretch** | 200 | 90% targets met |
| **Stress** | 500+ | Identify breaking point |

### **Error Rate Targets**

| Rating | Error Rate |
|--------|------------|
| **Excellent** | < 0.1% |
| **Good** | < 1% |
| **Acceptable** | < 5% |
| **Poor** | > 5% |

---

## 🧪 **Test Scenarios**

### **Scenario 1: Load Test** ([`k6/load-test.js`](../k6/load-test.js))

**Purpose:** Test overall application performance under realistic load

**Load Profile:**
```
Users:  0 ──→ 20 ──→ 50 ──→ 100 ──→ 200 ──→ 0
Time:   0s    30s    1.5m   3.5m    4.5m    5m
```

**Tests:**
- Landing page load time
- Learn page load time
- Login page load time
- Signup page load time

**Success Criteria:**
- ✅ 95% of requests < 2s
- ✅ Error rate < 1%
- ✅ No server crashes
- ✅ Stable memory usage

### **Scenario 2: API Performance** ([`k6/api-test.js`](../k6/api-test.js))

**Purpose:** Test API endpoint performance

**Load Profile:**
```
Users:  0 ──→ 10 ──→ 50 ──→ 100 ──→ 0
Time:   0s    30s    1.5m   2.5m    3m
```

**Tests:**
- `/api/categories` response time
- `/api/chapters` response time
- JSON validity
- Error handling

**Success Criteria:**
- ✅ 95% of requests < 1s
- ✅ Error rate < 5%
- ✅ Valid JSON responses
- ✅ No database timeouts

---

## 🚀 **Running Tests**

### **Step 1: Install K6**

**Windows (Chocolatey):**
```powershell
choco install k6
```

**macOS (Homebrew):**
```bash
brew install k6
```

**Or download from:** https://k6.io/docs/get-started/installation/

### **Step 2: Start Dev Server**
```bash
npm run dev
```

### **Step 3: Run Tests**

**Load Test:**
```bash
k6 run k6/load-test.js
```

**API Test:**
```bash
k6 run k6/api-test.js
```

**Both Tests:**
```bash
k6 run k6/load-test.js && k6 run k6/api-test.js
```

### **Step 4: Review Results**

Results are displayed in terminal and saved to:
- `k6/results/summary.json`

---

## 📈 **Interpreting Results**

### **Good Results Example**
```
✓ checks.........................: 98.50% ✓ 394  ✗ 6
✓ http_req_duration.............: avg=650ms p(95)=1400ms
✓ http_req_failed...............: 0.25%
✓ http_reqs.....................: 400
✓ vus...........................: max=200
```

**Analysis:** Excellent performance, meets all targets

### **Poor Results Example**
```
✗ checks.........................: 75.00% ✓ 300  ✗ 100
✗ http_req_duration.............: avg=3200ms p(95)=5800ms
✗ http_req_failed...............: 8.50%
✓ http_reqs.....................: 400
✓ vus...........................: max=200
```

**Analysis:** Performance issues, needs optimization

---

## 🔧 **Optimization Strategies**

### **If Response Times Are High:**

#### **1. Database Optimization**
```sql
-- Add indexes
CREATE INDEX idx_chapters_category ON chapters(category_id);
CREATE INDEX idx_chapters_published ON chapters(is_published);
CREATE INDEX idx_progress_user ON user_progress(user_id);

-- Analyze queries
EXPLAIN ANALYZE SELECT * FROM chapters WHERE is_published = true;
```

#### **2. API Route Optimization**
```typescript
// Add caching
export const revalidate = 60; // Revalidate every 60 seconds

// Use ISR
export const dynamic = 'force-static';

// Optimize queries
const { data } = await supabase
  .from('chapters')
  .select('id, title, category_id') // Only needed fields
  .eq('is_published', true)
  .limit(50); // Limit results
```

#### **3. Frontend Optimization**
```typescript
// Code splitting
const ChatInterface = dynamic(() => import('@/components/ChatInterface'));

// Image optimization
import Image from 'next/image';

// Lazy loading
const AudioPlayer = lazy(() => import('@/components/AudioPlayer'));
```

### **If Error Rates Are High:**

#### **1. Check Database Connections**
```typescript
// Increase connection pool
const supabase = createClient(url, key, {
  db: {
    pool: { max: 20 }
  }
});
```

#### **2. Add Rate Limiting**
```typescript
// Implement rate limiting
import { rateLimit } from '@/lib/rate-limiter';

export async function GET(request: Request) {
  const limited = await rateLimit(request);
  if (limited) {
    return new Response('Too many requests', { status: 429 });
  }
  // ... rest of handler
}
```

#### **3. Error Handling**
```typescript
// Better error handling
try {
  const data = await fetchData();
  return Response.json({ data });
} catch (error) {
  console.error('API Error:', error);
  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## 📊 **Monitoring in Production**

### **Recommended Tools**
- **Vercel Analytics** - Built-in performance monitoring
- **Sentry** - Error tracking and performance
- **PostHog** - User analytics and session replay
- **Supabase Dashboard** - Database performance

### **Key Metrics to Track**
1. **Response Times** - p50, p95, p99
2. **Error Rates** - 4xx, 5xx errors
3. **Database Performance** - Query times, connection pool
4. **API Usage** - Requests per minute, rate limits
5. **User Experience** - Core Web Vitals

---

## 🎯 **Performance Checklist**

### **Before Testing**
- [ ] Dev server running
- [ ] Database accessible
- [ ] No other heavy processes
- [ ] Stable network connection

### **During Testing**
- [ ] Monitor server CPU/memory
- [ ] Watch database connections
- [ ] Check for errors in logs
- [ ] Note any warnings

### **After Testing**
- [ ] Review all metrics
- [ ] Compare against targets
- [ ] Identify bottlenecks
- [ ] Document findings
- [ ] Plan optimizations

---

## 📝 **Test Execution Log**

### **Test Run Template**
```markdown
## Test Run: [Date]

**Configuration:**
- Max VUs: 200
- Duration: 5 minutes
- Base URL: http://localhost:3000

**Results:**
- Average Response Time: XXXms
- p(95) Response Time: XXXms
- Error Rate: X.XX%
- Total Requests: XXXX
- Requests/Second: XX

**Issues Found:**
1. [Issue description]
2. [Issue description]

**Optimizations Needed:**
1. [Optimization plan]
2. [Optimization plan]
```

---

## 🚀 **Next Steps**

After performance testing:

1. **Analyze Results** - Review all metrics
2. **Identify Bottlenecks** - Find slow queries, routes
3. **Optimize** - Implement improvements
4. **Re-test** - Verify optimizations work
5. **Document** - Update this guide with findings

---

**Maintained by:** Development Team  
**Questions?** See [k6/README.md](../k6/README.md) or K6 documentation