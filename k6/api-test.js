import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/**
 * K6 API Performance Test for LevelUp5
 * 
 * Tests API endpoint performance under load
 * 
 * Run with:
 * k6 run k6/api-test.js
 */

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Warm up
    { duration: '1m', target: 50 },    // Normal load
    { duration: '1m', target: 100 },   // High load
    { duration: '30s', target: 0 },    // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // 95% of API requests < 1s
    http_req_failed: ['rate<0.05'],     // Error rate < 5%
    errors: ['rate<0.1'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Test API endpoints
  const endpoints = [
    '/api/categories',
    '/api/chapters',
  ];

  endpoints.forEach((endpoint) => {
    const res = http.get(`${BASE_URL}${endpoint}`);
    
    check(res, {
      [`${endpoint} status is 200`]: (r) => r.status === 200,
      [`${endpoint} responds in <1s`]: (r) => r.timings.duration < 1000,
      [`${endpoint} has valid JSON`]: (r) => {
        try {
          JSON.parse(r.body);
          return true;
        } catch {
          return false;
        }
      },
    }) || errorRate.add(1);
    
    sleep(0.5);
  });

  sleep(1);
}