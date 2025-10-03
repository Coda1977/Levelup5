import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/**
 * K6 Load Test for LevelUp5
 * 
 * Tests application performance under load
 * 
 * Run with:
 * k6 run k6/load-test.js
 * 
 * Or with custom VUs:
 * k6 run --vus 50 --duration 2m k6/load-test.js
 */

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '1m', target: 200 },  // Spike to 200 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.01'],    // Error rate should be below 1%
    errors: ['rate<0.1'],              // Custom error rate below 10%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test 1: Landing Page
  let res = http.get(`${BASE_URL}/`);
  check(res, {
    'landing page status is 200': (r) => r.status === 200,
    'landing page loads in <2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);
  
  sleep(1);

  // Test 2: Learn Page (will redirect to login)
  res = http.get(`${BASE_URL}/learn`);
  check(res, {
    'learn page responds': (r) => r.status === 200 || r.status === 302,
    'learn page loads in <2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);
  
  sleep(1);

  // Test 3: Login Page
  res = http.get(`${BASE_URL}/auth/login`);
  check(res, {
    'login page status is 200': (r) => r.status === 200,
    'login page loads in <2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);
  
  sleep(1);

  // Test 4: Signup Page
  res = http.get(`${BASE_URL}/auth/signup`);
  check(res, {
    'signup page status is 200': (r) => r.status === 200,
    'signup page loads in <2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);
  
  sleep(2);
}

export function handleSummary(data) {
  return {
    'k6/results/summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;
  
  let summary = '\n';
  summary += `${indent}✓ checks.........................: ${data.metrics.checks.values.passes}/${data.metrics.checks.values.passes + data.metrics.checks.values.fails}\n`;
  summary += `${indent}✓ data_received.................: ${formatBytes(data.metrics.data_received.values.count)}\n`;
  summary += `${indent}✓ data_sent.....................: ${formatBytes(data.metrics.data_sent.values.count)}\n`;
  summary += `${indent}✓ http_req_duration.............: avg=${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += `${indent}✓ http_req_failed...............: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n`;
  summary += `${indent}✓ http_reqs.....................: ${data.metrics.http_reqs.values.count}\n`;
  summary += `${indent}✓ iterations....................: ${data.metrics.iterations.values.count}\n`;
  summary += `${indent}✓ vus...........................: ${data.metrics.vus.values.max}\n`;
  
  return summary;
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}