
import { check, sleep } from 'k6';
import http from 'k6/http';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const pageLoadTime = new Trend('page_load_time');
const formSubmissionTime = new Trend('form_submission_time');
const errorRate = new Rate('error_rate');

// Load test configuration
export const options = {
  stages: [
    // Ramp up
    { duration: '1m', target: 10 }, // Ramp up to 10 users over 1 minute
    { duration: '3m', target: 10 }, // Stay at 10 users for 3 minutes
    { duration: '2m', target: 20 }, // Ramp up to 20 users over 2 minutes
    { duration: '3m', target: 20 }, // Stay at 20 users for 3 minutes
    { duration: '1m', target: 0 },  // Ramp down to 0 users over 1 minute
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.05'],    // Error rate should be below 5%
    page_load_time: ['p(95)<3000'],    // Page load should be below 3s for 95% of requests
    form_submission_time: ['p(95)<5000'], // Form submission should be below 5s for 95% of requests
    error_rate: ['rate<0.1'],          // Custom error rate should be below 10%
  },
};

// Configuration
const FRONTEND_URL = __ENV.FRONTEND_URL || 'http://localhost:30080';
const BACKEND_URL = 'http://localhost:30090';

// Test data generators
function generateRandomName() {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa', 'James', 'Maria'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function generateRandomPhone() {
  return `08${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
}

function generateRandomEmail(name) {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const cleanName = name.toLowerCase().replace(' ', '.');
  return `${cleanName}${Math.floor(Math.random() * 1000)}@${domains[Math.floor(Math.random() * domains.length)]}`;
}

function generateRandomIncome() {
  // Generate income between 5,000 and 200,000
  return Math.floor(Math.random() * 195000) + 5000;
}

function generateRandomLoanAmount() {
  // Generate loan amount between 10,000 and 1,000,000
  return Math.floor(Math.random() * 990000) + 10000;
}

function generateRandomAge() {
  // Generate age between 18 and 65
  return Math.floor(Math.random() * 47) + 18;
}

function generateRandomLoanPurpose() {
  const purposes = ['education', 'home', 'car', 'business', 'personal'];
  return purposes[Math.floor(Math.random() * purposes.length)];
}

export default function () {
  // Step 1: Load the frontend page
  console.log(`Loading frontend page: ${FRONTEND_URL}`);
  
  const pageStartTime = Date.now();
  const pageResponse = http.get(FRONTEND_URL, {
    headers: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  });
  
  const pageLoadDuration = Date.now() - pageStartTime;
  pageLoadTime.add(pageLoadDuration);

  // Check if page loaded successfully
  const pageLoadSuccess = check(pageResponse, {
    'frontend page loads successfully': (r) => r.status === 200,
    'frontend page contains form': (r) => r.body.includes('Loan Pre-Qualification'),
    'frontend page loads in reasonable time': () => pageLoadDuration < 5000,
  });

  if (!pageLoadSuccess) {
    errorRate.add(1);
    console.error(`Failed to load frontend page. Status: ${pageResponse.status}`);
    return;
  }

  // Simulate user thinking time (reading the form)
  sleep(Math.random() * 3 + 1); // 1-4 seconds

  // Step 2: Generate realistic form data
  const fullName = generateRandomName();
  const formData = {
    fullName: fullName,
    phoneNumber: generateRandomPhone(),
    monthlyIncome: generateRandomIncome(),
    loanAmount: generateRandomLoanAmount(),
    loanPurpose: generateRandomLoanPurpose(),
    age: generateRandomAge(),
    email: generateRandomEmail(fullName),
  };

  console.log(`Submitting loan application for: ${formData.fullName}`);

  // Step 3: Submit the form
  const formStartTime = Date.now();
  const formResponse = http.post(`${BACKEND_URL}/api/v1/loans`, JSON.stringify(formData), {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Origin': FRONTEND_URL,
      'Referer': FRONTEND_URL,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    },
  });

  const formSubmissionDuration = Date.now() - formStartTime;
  formSubmissionTime.add(formSubmissionDuration);

  // Step 4: Validate form submission response
  const formSubmissionSuccess = check(formResponse, {
    'form submission returns valid status': (r) => r.status === 200 || r.status === 201,
    'form submission returns JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
    'form submission completes in reasonable time': () => formSubmissionDuration < 10000,
  });

  // Step 5: Validate response structure
  let responseData;
  try {
    responseData = JSON.parse(formResponse.body);
  } catch (e) {
    console.error(`Failed to parse response JSON: ${e.message}`);
    errorRate.add(1);
    return;
  }

  const responseValidation = check(responseData, {
    'response contains applicationId': (data) => data.applicationId && typeof data.applicationId === 'string',
    'response contains eligible field': (data) => typeof data.eligible === 'boolean',
    'response contains reason': (data) => data.reason && typeof data.reason === 'string',
    'response contains timestamp': (data) => data.timestamp && typeof data.timestamp === 'string',
  });

  // Step 6: Log results for monitoring
  if (formSubmissionSuccess && responseValidation) {
    console.log(`✅ Successful application for ${formData.fullName}: ${responseData.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'} - ${responseData.reason}`);
  } else {
    console.error(`❌ Failed application for ${formData.fullName}. Status: ${formResponse.status}, Response: ${formResponse.body}`);
    errorRate.add(1);
  }

  // Step 7: Simulate user reviewing results
  sleep(Math.random() * 2 + 1); // 1-3 seconds

  // Step 8: Simulate some users submitting multiple applications (20% chance)
  if (Math.random() < 0.2) {
    console.log(`User ${formData.fullName} is submitting a second application`);
    
    // Generate slightly different data for second application
    const secondFormData = {
      ...formData,
      fullName: formData.fullName + ' Jr',
      loanAmount: generateRandomLoanAmount(),
      loanPurpose: generateRandomLoanPurpose(),
    };

    sleep(Math.random() * 2 + 1); // Think time

    const secondFormResponse = http.post(`${BACKEND_URL}/api/v1/loans`, JSON.stringify(secondFormData), {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Origin': FRONTEND_URL,
        'Referer': FRONTEND_URL,
      },
    });

    check(secondFormResponse, {
      'second form submission successful': (r) => r.status === 200 || r.status === 201,
    });
  }

  // Step 9: Simulate user session end
  sleep(Math.random() * 1 + 0.5); // 0.5-1.5 seconds before leaving
}

// Setup function (runs once at the beginning)
export function setup() {
  console.log('🚀 Starting Frontend Load Test');
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Backend URL: ${BACKEND_URL}`);
  
  // Verify that both frontend and backend are accessible
  const frontendCheck = http.get(FRONTEND_URL);
  const backendCheck = http.get(`${BACKEND_URL}/health`);
  
  if (frontendCheck.status !== 200) {
    console.error(`❌ Frontend not accessible at ${FRONTEND_URL}. Status: ${frontendCheck.status}`);
  } else {
    console.log(`✅ Frontend accessible at ${FRONTEND_URL}`);
  }
  
  if (backendCheck.status !== 200) {
    console.warn(`⚠️  Backend health check failed at ${BACKEND_URL}/health. Status: ${backendCheck.status}`);
    console.log('Proceeding with load test anyway...');
  } else {
    console.log(`✅ Backend accessible at ${BACKEND_URL}`);
  }
  
  return {
    frontendUrl: FRONTEND_URL,
    backendUrl: BACKEND_URL,
  };
}

// Teardown function (runs once at the end)
export function teardown(data) {
  console.log('🏁 Frontend Load Test Complete');
  console.log(`Tested Frontend: ${data.frontendUrl}`);
  console.log(`Tested Backend: ${data.backendUrl}`);
}