/**
 * SINEA API LOAD TESTING SCRIPT
 * 
 * Simulates concurrent users accessing Sinea's API.
 * Uses native Node.js modules (no npm install required).
 * 
 * Usage:
 *   node load-test.js [target_url] [concurrency] [total_requests] [endpoint] [jwt_token]
 * 
 * Examples:
 *   1. Hit public /films endpoint (200 requests, 50 at a time):
 *      node apps/backend/scripts/load-test.js https://api.sinea.id 50 200 /films
 * 
 *   2. Hit protected profile endpoint using a JWT token:
 *      node apps/backend/scripts/load-test.js https://api.sinea.id 30 150 /auth/profile "your_jwt_token_here"
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Parse arguments
const TARGET_URL = process.argv[2] || 'https://api.sinea.id';
const CONCURRENCY = parseInt(process.argv[3]) || 50;
const TOTAL_REQUESTS = parseInt(process.argv[4]) || 200;
const ENDPOINT = process.argv[5] || '/films';
const JWT_TOKEN = process.argv[6] || '';

console.log('==================================================');
console.log('         SINEA API LOAD TESTING SCRIPT            ');
console.log('==================================================');
console.log(`Target URL:      ${TARGET_URL}`);
console.log(`Endpoint:        ${ENDPOINT}`);
console.log(`Concurrency:     ${CONCURRENCY}`);
console.log(`Total Requests:  ${TOTAL_REQUESTS}`);
console.log(`Auth Type:       ${JWT_TOKEN ? 'JWT Token Provided' : 'Anonymous / Guest'}`);
console.log('--------------------------------------------------\n');

async function runTest() {
  const start = Date.now();
  let completed = 0;
  let success = 0;
  let failed = 0;
  const responseTimes = [];
  const statusCodes = {};

  const fullUrl = new URL(ENDPOINT, TARGET_URL).toString();
  
  // Create a queue of requests
  const queue = Array.from({ length: TOTAL_REQUESTS });
  
  // Helper to send a single request
  const sendRequest = () => {
    return new Promise((resolve) => {
      const reqStart = Date.now();
      const client = fullUrl.startsWith('https') ? https : http;
      
      const headers = {
        'User-Agent': 'SineaLoadTester/1.0',
        'Accept': 'application/json'
      };

      if (JWT_TOKEN) {
        headers['Authorization'] = `Bearer ${JWT_TOKEN}`;
      }
      
      const req = client.get(fullUrl, {
        headers,
        timeout: 10000 // 10 seconds timeout
      }, (res) => {
        const duration = Date.now() - reqStart;
        responseTimes.push(duration);
        completed++;
        
        const code = res.statusCode;
        statusCodes[code] = (statusCodes[code] || 0) + 1;
        
        if (code >= 200 && code < 300) {
          success++;
        } else {
          failed++;
        }
        
        // Consume response data to free socket back to connection pool
        res.on('data', () => {});
        res.on('end', () => resolve());
      });
      
      req.on('error', (err) => {
        const duration = Date.now() - reqStart;
        responseTimes.push(duration);
        completed++;
        failed++;
        statusCodes['ERROR'] = (statusCodes['ERROR'] || 0) + 1;
        resolve();
      });
      
      req.on('timeout', () => {
        req.destroy();
      });
    });
  };

  // Start concurrent workers
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push((async () => {
      while (queue.length > 0) {
        queue.pop();
        await sendRequest();
      }
    })());
  }

  // Print progress periodically
  const progressInterval = setInterval(() => {
    const elapsed = (Date.now() - start) / 1000;
    const progress = ((completed / TOTAL_REQUESTS) * 100).toFixed(1);
    console.log(`Progress: ${progress}% (${completed}/${TOTAL_REQUESTS}) | Success: ${success} | Failed: ${failed} | Elapsed: ${elapsed.toFixed(1)}s`);
  }, 1000);

  await Promise.all(workers);
  clearInterval(progressInterval);

  const end = Date.now();
  const totalDurationSec = (end - start) / 1000;
  
  if (responseTimes.length === 0) {
    console.log('\nError: No responses received.');
    return;
  }

  const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const minResponseTime = Math.min(...responseTimes);
  const maxResponseTime = Math.max(...responseTimes);
  const rps = (completed / totalDurationSec).toFixed(2);

  console.log('\n==================================================');
  console.log('                 TEST RESULTS                     ');
  console.log('==================================================');
  console.log(`Duration:          ${totalDurationSec.toFixed(2)} seconds`);
  console.log(`Total Requests:    ${completed}`);
  console.log(`Successful:        ${success}`);
  console.log(`Failed/Errors:     ${failed}`);
  console.log(`Requests/Sec (RPS): ${rps}`);
  console.log('\nResponse Times (Latency):');
  console.log(`  Min:             ${minResponseTime}ms`);
  console.log(`  Max:             ${maxResponseTime}ms`);
  console.log(`  Average:         ${avgResponseTime.toFixed(1)}ms`);
  console.log('\nStatus Codes Breakdown:');
  Object.entries(statusCodes).forEach(([code, count]) => {
    console.log(`  Code ${code}: ${count} requests`);
  });
  console.log('==================================================\n');
}

runTest().catch(console.error);
