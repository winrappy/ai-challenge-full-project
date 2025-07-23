import http from 'k6/http';
import { check } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export let options = {
  stages: [{ "duration": "10s", "target": 1 }],
  thresholds: {
    http_req_duration: ['p(95)<800'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:30090';

export default function () {
  const suiteId = uuidv4();
  // Test cases for different validation scenarios
  const testCases = [
    // fullName validation
    {
      payload: {
        fullName: "A", // Too short (less than 2 chars)
        monthlyIncome: 50000,
        loanAmount: 240000,
        loanPurpose: 'education',
        age: 30,
        phoneNumber: "0851234567",
        email: "demo@example.com",
      },
      expected: {
        status: 400,
        error: { "message": "Invalid request body", "reason": "Full name must be between 2 and 255 characters" }
      }
    },
    {
      payload: {
        fullName: "A".repeat(256), // Too long (more than 255 chars)
        monthlyIncome: 50000,
        loanAmount: 240000,
        loanPurpose: 'education',
        age: 30,
        phoneNumber: "0851234567",
        email: "demo@example.com",
      },
      expected: {
        status: 400,
        error: { "message": "Invalid request body", "reason": "Full name must be between 2 and 255 characters" }
      }
    },
    // monthlyIncome validation
    {
      payload: {
        fullName: `${suiteId}-Low Income User`,
        monthlyIncome: 4999, // Below minimum 5000
        loanAmount: 240000,
        loanPurpose: 'education',
        age: 30,
        phoneNumber: "0851234567",
        email: "demo@example.com",
      },
      expected: {
        status: 400,
        error: { "message": "Invalid request body", "reason": "Monthly income must be between 5,000 and 5,000,000" }
      }
    },
    {
      payload: {
        fullName: `${suiteId}-High Income User`,
        monthlyIncome: 5000001, // Above maximum 5,000,000
        loanAmount: 240000,
        loanPurpose: 'education',
        age: 30,
        phoneNumber: "0851234567",
        email: "demo@example.com",
      },
      expected: {
        status: 400,
        error: { "message": "Invalid request body", "reason": "Monthly income must be between 5,000 and 5,000,000" }
      }
    },
    // loanAmount validation
    {
      payload: {
        fullName: `${suiteId}-Small Loan User`,
        monthlyIncome: 50000,
        loanAmount: 999, // Below minimum 1000
        loanPurpose: 'education',
        age: 30,
        phoneNumber: "0851234567",
        email: "demo@example.com",
      },
      expected: {
        status: 400,
        error: { "message": "Invalid request body", "reason": "Loan amount must be between 1,000 and 5,000,000" }
      }
    },
    {
      payload: {
        fullName: `${suiteId}-Large Loan User`,
        monthlyIncome: 50000,
        loanAmount: 5000001, // Above maximum 5,000,000
        loanPurpose: 'education',
        age: 30,
        phoneNumber: "0851234567",
        email: "demo@example.com",
      },
      expected: {
        status: 400,
        error: { "message": "Invalid request body", "reason": "Loan amount must be between 1,000 and 5,000,000" }
      }
    },
    // loanPurpose validation
    {
      payload: {
        fullName: `${suiteId}-Empty Purpose User`,
        monthlyIncome: 50000,
        loanAmount: 240000,
        loanPurpose: '', // Empty purpose
        age: 30,
        phoneNumber: "0851234567",
        email: "demo@example.com",
      },
      expected: {
        status: 400,
        error: { "message": "Invalid request body", "reason": "missing required fields: loanPurpose" }
      }
    },
    {
      payload: {
        fullName: `${suiteId}-Invalid Purpose User`,
        monthlyIncome: 50000,
        loanAmount: 240000,
        loanPurpose: 'invalid_purpose', // Not in the list
        age: 30,
        phoneNumber: "0851234567",
        email: "demo@example.com",
      },
      expected: {
        status: 400,
        error: { "message": "Invalid request body", "reason": "Loan purpose must be one of: education, home, car, business, personal" }
      }
    },
    // age validation
    {
      payload: {
        fullName: `${suiteId}-Zero Age User`,
        monthlyIncome: 50000,
        loanAmount: 240000,
        loanPurpose: 'education',
        // age missing
        phoneNumber: "0851234567",
        email: "demo@example.com",
      },
      expected: {
        status: 400,
        error: { "message": "Invalid request body", "reason": "missing required fields: age" }
      }
    },
    {
      payload: {
        fullName: `${suiteId}-Negative Age User`,
        monthlyIncome: 50000,
        loanAmount: 240000,
        loanPurpose: 'education',
        age: -1, // Negative age
        phoneNumber: "0851234567",
        email: "demo@example.com",
      },
      expected: {
        status: 400,
        error: { "message": "Invalid request body", "reason": "Age must be a number more than 0" }
      }
    },
    // phoneNumber validation
    {
      payload: {
        fullName: `${suiteId}-Invalid Phone User 1`,
        monthlyIncome: 50000,
        loanAmount: 240000,
        loanPurpose: 'education',
        age: 30,
        phoneNumber: "123456789", // Doesn't start with 0
        email: "demo@example.com",
      },
      expected: {
        status: 400,
        error: { "message": "Invalid request body", "reason": "Phone number must be 10 digits" }
      }
    },
    {
      payload: {
        fullName: `${suiteId}-Invalid Phone User 2`,
        monthlyIncome: 50000,
        loanAmount: 240000,
        loanPurpose: 'education',
        age: 30,
        phoneNumber: "08512A4567", // Contains non-numeric character
        email: "demo@example.com",
      },
      expected: {
        status: 400,
        error: { "message": "Invalid request body", "reason": "Phone number must be numeric" }
      }
    },
    // email validation
    {
      payload: {
        fullName: `${suiteId}-Invalid Email User`,
        monthlyIncome: 50000,
        loanAmount: 240000,
        loanPurpose: 'education',
        age: 30,
        phoneNumber: "0851234567",
        email: "not-an-email", // Invalid email format
      },
      expected: {
        status: 400,
        error: { "message": "Invalid request body", "reason": "Email must be a valid email address" }
      }
    },
    // Missing required fields
    {
      payload: {
        fullName: `${suiteId}-Missing Fields User`,
        monthlyIncome: 50000,
        // loanAmount missing
        loanPurpose: 'education',
        age: 30,
        phoneNumber: "0851234567",
        email: "demo@example.com",
      },
      expected: {
        status: 400,
        error: { "message": "Invalid request body", "reason": "missing required fields: loanAmount" }
      }
    },
    {
      payload: {
        // fullName missing
        // monthlyIncome missing
        // loanAmount missing
        // loanPurpose missing
        // age missing
        // phoneNumber missing
        // email missing
      },
      expected: {
        status: 400,
        error: { "message": "Invalid request body", "reason": "missing required fields: fullName, monthlyIncome, loanAmount, loanPurpose, age, phoneNumber, email" }
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

    check(res, {
      [`Status check for ${payload.fullName}`]: (r) => {
        const result = r.status === tc.expected.status;
        if (!result) {
          console.error(`❌ ERROR: HTTP status mismatch for ${payload.fullName}`);
          console.error(`Expected: ${tc.expected.status}`);
          console.error(`Actual: ${r.status}`);
          console.error(`Test case details: ${JSON.stringify(payload)}`);
          console.error(`Response body: ${r.body}`);
        }
        return result;
      }
    });

    // For error responses, check for error details
    check(res, {
      'response includes correct error details': (r) => {
        try {
          const body = JSON.parse(r.body);
          const expectedError = tc.expected.error;
          const result = body.message === expectedError.message &&
            body.reason === expectedError.reason;
          if (!result) {
            console.error(`❌ ERROR: Error details mismatch for ${payload.fullName}`);
            console.error(`Expected: ${JSON.stringify(expectedError)}`);
            console.error(`Actual: ${JSON.stringify(body)}`);
          }
          return result;
        } catch (e) {
          console.error(`❌ ERROR: Could not parse response body for ${payload.fullName}`);
          console.error(`Response body: ${r.body}`);
          return false;
        }
      }
    });
  }
}
