# Performance Testing with K6

Load and performance tests for LevelUp5 using Grafana K6.

## 📋 **Test Scenarios**

### 1. **Load Test** ([`load-test.js`](load-test.js))
Tests overall application performance under increasing load.

**Load Profile:**
- 30s: Ramp up to 20 users
- 1m: Ramp up to 50 users  
- 2m: Ramp up to 100 users
- 1m: Spike to 200 users
- 30s: Ramp down to 0

**Pages Tested:**
- Landing page (`/`)
- Learn page (`/learn`)
- Login page (`/auth/login`)
- Signup page (`/auth/signup`)

**Thresholds:**
- 95% of requests < 2 seconds
- Error rate < 1%

### 2. **API Test** ([`api-test.js`](api-test.js))
Tests API endpoint performance under load.

**Load Profile:**
- 30s: Warm up to 10 users
- 1m: Normal load (50 users)
- 1m: High load (100 users)
- 30s: Cool down

**Endpoints Tested:**
- `/api/categories`
- `/api/chapters`

**Thresholds:**
- 95% of requests < 1 second
- Error rate < 5%
- Valid JSON responses

## 🚀 **Installation**

### **Windows:**
```powershell
# Using Chocolatey
choco install k6

# Or download from https://k6.io/docs/get-started/installation/
```

### **macOS:**
```bash
brew install k6
```

### **Linux:**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

## 🏃 **Running Tests**

### **Prerequisites**
1. Start the development server:
```bash
npm run dev
```

2. Ensure server is running at http://localhost:3000

### **Run Load Test**
```bash
k6 run k6/load-test.js
```

### **Run API Test**
```bash
k6 run k6/api-test.js
```

### **Custom Configuration**
```bash
# Custom VUs and duration
k6 run --vus 100 --duration 5m k6/load-test.js

# Custom base URL
k6 run -e BASE_URL=https://your-domain.com k6/load-test.js

# Output to file
k6 run k6/load-test.js --out json=results.json
```

## 📊 **Understanding Results**

### **Key Metrics**

#### **http_req_duration**
- Average response time
- p(95): 95th percentile (95% of requests faster than this)
- p(99): 99th percentile

**Target:** p(95) < 2000ms for pages, < 1000ms for APIs

#### **http_req_failed**
- Percentage of failed requests
- Includes 4xx and 5xx errors

**Target:** < 1% error rate

#### **http_reqs**
- Total number of requests
- Requests per second (RPS)

**Target:** Handle 200+ concurrent users

#### **vus (Virtual Users)**
- Number of concurrent users
- Max VUs reached during test

**Target:** 200 concurrent users

### **Sample Output**
```
✓ checks.........................: 95.00% ✓ 380  ✗ 20
✓ data_received.................: 2.5 MB
✓ data_sent.....................: 156 KB
✓ http_req_duration.............: avg=450ms p(95)=1200ms
✓ http_req_failed...............: 0.50%
✓ http_reqs.....................: 400
✓ iterations....................: 100
✓ vus...........................: 200
```

## 🎯 **Performance Targets**

### **Page Load Times**
| Page | Target | Acceptable | Poor |
|------|--------|------------|------|
| Landing | < 1s | < 2s | > 2s |
| Learn | < 1.5s | < 3s | > 3s |
| Chapter | < 2s | < 4s | > 4s |
| Chat | < 1s | < 2s | > 2s |

### **API Response Times**
| Endpoint | Target | Acceptable | Poor |
|----------|--------|------------|------|
| /api/categories | < 200ms | < 500ms | > 500ms |
| /api/chapters | < 300ms | < 800ms | > 800ms |
| /api/progress | < 200ms | < 500ms | > 500ms |
| /api/chat | < 5s | < 10s | > 10s |

### **Concurrent Users**
- **Minimum:** 50 users
- **Target:** 100 users
- **Stretch:** 200 users

### **Error Rates**
- **Excellent:** < 0.1%
- **Good:** < 1%
- **Acceptable:** < 5%
- **Poor:** > 5%

## 🔧 **Troubleshooting**

### **High Response Times**
1. Check database query performance
2. Review API route logic
3. Check for N+1 queries
4. Consider caching strategies

### **High Error Rates**
1. Check server logs
2. Review database connection limits
3. Check for rate limiting issues
4. Verify Supabase connection pool

### **Memory Issues**
1. Monitor Node.js memory usage
2. Check for memory leaks
3. Review large data fetches
4. Consider pagination

## 📈 **Optimization Strategies**

### **Database**
- Add indexes on frequently queried columns
- Use connection pooling
- Implement query caching
- Optimize RLS policies

### **API Routes**
- Implement response caching
- Use ISR (Incremental Static Regeneration)
- Optimize data fetching
- Reduce payload sizes

### **Frontend**
- Code splitting
- Image optimization
- Lazy loading
- Bundle size reduction

## 📝 **Creating Custom Tests**

### **Basic Structure**
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const res = http.get('http://localhost:3000/your-page');
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });
  
  sleep(1);
}
```

### **Advanced Features**
```javascript
// Custom metrics
import { Trend } from 'k6/metrics';
const myTrend = new Trend('my_custom_metric');

// Scenarios
export const options = {
  scenarios: {
    constant_load: {
      executor: 'constant-vus',
      vus: 50,
      duration: '5m',
    },
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 200 },
        { duration: '1m', target: 200 },
        { duration: '10s', target: 0 },
      ],
    },
  },
};
```

## 🎯 **Success Criteria**

Tests pass if:
- ✅ p(95) response time < 2s for pages
- ✅ p(95) response time < 1s for APIs
- ✅ Error rate < 1%
- ✅ Handles 200 concurrent users
- ✅ No memory leaks
- ✅ Database connections stable

## 📚 **Resources**

- [K6 Documentation](https://k6.io/docs/)
- [K6 Examples](https://k6.io/docs/examples/)
- [Performance Testing Guide](https://k6.io/docs/testing-guides/)
- [Thresholds](https://k6.io/docs/using-k6/thresholds/)

## ⚠️ **Important Notes**

### **Before Running**
1. Ensure dev server is running
2. Database is accessible
3. No other heavy processes running
4. Stable network connection

### **During Tests**
- Monitor server CPU/memory
- Watch database connections
- Check for errors in logs
- Note any warnings

### **After Tests**
- Review results carefully
- Compare against targets
- Identify bottlenecks
- Plan optimizations

## 🔄 **CI/CD Integration**

### **GitHub Actions Example**
```yaml
- name: Run K6 Load Test
  run: |
    k6 run k6/load-test.js --out json=results.json
    
- name: Check Performance
  run: |
    # Parse results and fail if thresholds not met
    node scripts/check-k6-results.js
```

---

**Created:** 2025-10-03  
**Last Updated:** 2025-10-03  
**Status:** Ready for performance testing