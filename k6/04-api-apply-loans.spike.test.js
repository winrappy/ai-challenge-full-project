import http from 'k6/http';
import { check } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
  stages: [
    { duration: '30s', target: 10 },    // Warm-up with minimal load
    { duration: '1m', target: 100 },     // Maintain minimal load
    { duration: '30s', target: 500 },   // Spike to very high load quickly
    { duration: '1m', target: 1000 },    // Maintain spike for 1 minutes
    { duration: '30s', target: 0 }      // Ramp down quickly
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],  // 95% of requests under 1s, 99% under 2s
    http_req_failed: ['rate<0.05'],                   // Less than 5% failure rate
  },
  // Spike test configuration
  // This simulates a sudden, dramatic increase in users
  // to evaluate how the system handles rapid traffic surges
  // and whether it can recover quickly after the spike
};
const BASE_URL = __ENV.BASE_URL || 'http://localhost:30090';

export default function () {
  const suiteId = uuidv4();
  // Test cases for different eligibility scenarios
  const testCases = [
    // Eligible case
    {
      payload: {
        fullName: `${suiteId}-Eligible User`,
        monthlyIncome: 50000, // Sufficient income
        loanAmount: 240000, // 2 * 50000 * 12 = 1200000
        loanPurpose: 'education',
        age: 30, // Within age range
        phoneNumber: "0851234567",
        email: "demo@example.com",
      },
      expected: {
        eligible: true,
        reason: 'Eligible under base rules'
      }
    },
    // Insufficient income case
    {
      payload: {
        fullName: `${suiteId}-Low Income User`,
        monthlyIncome: 9999, // Insufficient income
        loanAmount: 200001, // Monthly income < 2 * (120000/12) and loan amount <= 10 * monthlyIncome
        loanPurpose: 'education',
        age: 30, // Within age range
        phoneNumber: "0851234567",
        email: "demo@example.com",
      },
      expected: {
        eligible: false,
        reason: 'Monthly income is insufficient'
      }
    },
    // Age out of range cases
    {
      payload: {
        fullName: `${suiteId}-Too Young User`,
        monthlyIncome: 50000, // Sufficient income
        loanAmount: 240000, // Monthly income >= 2 * (240000/12)
        loanPurpose: 'education',
        age: 19, // Age < 20
        phoneNumber: "0851234567",
        email: "demo@example.com",
      },
      expected: {
        eligible: false,
        reason: 'Age not in range (must be between 20-60)'
      }
    },
    {
      payload: {
        fullName: `${suiteId}-Too Old User`,
        monthlyIncome: 50000, // Sufficient income
        loanAmount: 240000, // Monthly income >= 2 * (240000/12)
        loanPurpose: 'education',
        age: 61, // Age > 60
        phoneNumber: "0851234567",
        email: "demo@example.com",
      },
      expected: {
        eligible: false,
        reason: 'Age not in range (must be between 20-60)'
      }
    },
    // Excessive loan amount case
    {
      payload: {
        fullName: `${suiteId}-High Risk User`,
        monthlyIncome: 500000,
        loanAmount: 1000000,
        loanPurpose: 'business',
        age: 30,
        phoneNumber: "0851234567",
        email: "demo@example.com",
      },
      expected: {
        eligible: false,
        reason: 'Business loans not supported'
      }
    }
  ];

  // Test each case
  for (const tc of testCases) {
    const payload = tc.payload;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + (__ENV.AUTH_TOKEN || ''),
    };

    // Send the POST request: /api/v1/loans
    const res = http.post(BASE_URL + '/api/v1/loans', JSON.stringify(payload), { headers });


    /**
     * Expected response format:

      {
        "applicationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "eligible": true,
        "reason": "Eligible under base rules",
        "timestamp": "2025-07-19T19:34:56+07:00"
      }
    */

    check(res, {
      'status is 200': (r) => {
        const result = r.status === 200;
        if (!result) {
          console.error(`❌ ERROR: HTTP status mismatch for ${payload.fullName}`);
          console.error(`Expected: 200`);
          console.error(`Actual: ${r.status}`);
        }
        return result;
      }
    });

    check(res, {
      'response includes eligibility': (r) => {
        const eligibility = r.json('eligible');
        if (eligibility === undefined) {
          console.error(`❌ ERROR: Missing eligibility field for ${payload.fullName}`);
          console.error(`Response: ${JSON.stringify(r.json())}`);
          return false;
        }
        return true;
      }
    });

    check(res, {
      'response has applicationId': (r) => {
        const applicationId = r.json('applicationId');
        if (!applicationId) {
          console.error(`❌ ERROR: Missing applicationId field for ${payload.fullName}`);
          console.error(`Response: ${JSON.stringify(r.json())}`);
          return false;
        }
        return true;
      }
    });

    check(res, {
      'response has timestamp': (r) => {
        const timestamp = r.json('timestamp');
        if (!timestamp) {
          console.error(`❌ ERROR: Missing timestamp field for ${payload.fullName}`);
          console.error(`Response: ${JSON.stringify(r.json())}`);
          return false;
        }
        return true;
      }
    });

    check(res, {
      'eligible matches expected': (r) => {
        const result = r.json('eligible') === tc.expected.eligible;
        if (!result) {
          console.error(`❌ ERROR: Eligibility status mismatch for ${payload.fullName}`);
          console.error(`Expected: ${tc.expected.eligible}`);
          console.error(`Actual: ${r.json('eligible')}`);
          console.error(`Test case details: ${JSON.stringify(payload.payload)}`);
          console.error(`Full response: ${JSON.stringify(r.json())}`);
        }
        return result;
      }
    });

    check(res, {
      'reason matches expected': (r) => {
        const actualReason = r.json('reason');
        const expectedReason = tc.expected.reason;

        // If no reason is expected, it's valid if no reason is provided
        if (!expectedReason && !actualReason) {
          return true;
        }

        // If a reason is expected, it must match exactly
        if (expectedReason && actualReason !== expectedReason) {
          console.error(`❌ ERROR: Reason mismatch for ${payload.fullName}`);
          console.error(`Expected: ${expectedReason}`);
          console.error(`Actual: ${actualReason}`);
          console.error(`Test case details: ${JSON.stringify(payload.payload)}`);
          console.error(`Full response: ${JSON.stringify(r.json())}`);
          return false;
        }

        return true;
      }
    });
  }
}
