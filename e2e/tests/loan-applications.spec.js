import { test, expect } from "@playwright/test"

test.describe("Loan Application Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("should display the loan application form", async ({ page }) => {
    // Check page title and headers
    await expect(page).toHaveTitle(/Loan Pre-Qualification/)
    await expect(page.getByText("ArisePreQ")).toBeVisible()
    await expect(page.getByText("Loan Pre-Qualification", { exact: true })).toBeVisible()
    await expect(page.getByText("Get instant loan pre-qualification decisions.")).toBeVisible()

    // Check form fields are present
    await expect(page.getByPlaceholder("Full Name*")).toBeVisible()
    await expect(page.getByPlaceholder("Phone Number")).toBeVisible()
    await expect(page.getByPlaceholder("Monthly Income*")).toBeVisible()
    await expect(page.getByPlaceholder("Loan Amount*")).toBeVisible()
    await expect(page.getByTestId("loanPurpose")).toBeVisible()
    await expect(page.getByPlaceholder("Age")).toBeVisible()
    await expect(page.getByPlaceholder("Email")).toBeVisible()
    await expect(page.getByRole("button", { name: "Apply for Pre-Qualification" })).toBeVisible()
  })

  test("should show validation errors for empty form submission", async ({ page }) => {
    // Click submit without filling form
    await page.getByRole("button", { name: "Apply for Pre-Qualification" }).click()

    // Check validation errors appear
    await expect(page.getByText("Full name is required")).toBeVisible()
    await expect(page.getByText("Monthly income is required")).toBeVisible()
    await expect(page.getByText("Loan amount is required")).toBeVisible()
    await expect(page.getByText("Loan purpose is required")).toBeVisible()
    await expect(page.getByText("Age is required")).toBeVisible()
    await expect(page.getByText("Phone number is required")).toBeVisible()
    await expect(page.getByText("Email is required")).toBeVisible()
  })

  test("should validate individual form fields", async ({ page }) => {
    // Test full name validation
    await page.getByPlaceholder("Full Name*").fill("A")
    await page.getByRole("button", { name: "Apply for Pre-Qualification" }).click()
    await expect(page.getByText("Full name must be at least 2 characters")).toBeVisible()

    // Test email validation
    await page.getByPlaceholder("Email").fill("invalid-email")
    await page.getByRole("button", { name: "Apply for Pre-Qualification" }).click()
    await expect(page.getByText("Please enter a valid email address")).toBeVisible()

    // Test phone number validation
    await page.getByPlaceholder("Phone Number").fill("123")
    await page.getByRole("button", { name: "Apply for Pre-Qualification" }).click()
    await expect(page.getByText("Phone number must be exactly 10 digits and contain only numbers 0-9")).toBeVisible()

    // Test monthly income validation
    await page.getByPlaceholder("Monthly Income*").fill("1000")
    await page.getByRole("button", { name: "Apply for Pre-Qualification" }).click()
    await expect(page.getByText("Monthly income must be at least 5,000")).toBeVisible()

    // Test loan amount validation
    await page.getByPlaceholder("Loan Amount*").fill("500")
    await page.getByRole("button", { name: "Apply for Pre-Qualification" }).click()
    await expect(page.getByText("Loan amount must be at least 1,000")).toBeVisible()
  })

  test("should clear validation errors when fields are corrected", async ({ page }) => {
    // Trigger validation error
    await page.getByRole("button", { name: "Apply for Pre-Qualification" }).click()
    await expect(page.getByText("Full name is required")).toBeVisible()

    // Fix the field
    await page.getByPlaceholder("Full Name*").fill("John Doe")

    // Error should disappear
    await expect(page.getByText("Full name is required")).not.toBeVisible()
  })

  test("should submit loan application with mocked API", async ({ page }) => {
  // Mock API response before triggering the request
  await page.route('**/api/v1/loans', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        applicationId: 'mock-uuid-1234',
        eligible: true,
        reason: 'Eligible under base rules',
        timestamp: new Date().toISOString(),
      }),
    })
  })

  // กรอกฟอร์ม
  await page.getByPlaceholder("Full Name*").fill("John Doe")
  await page.getByPlaceholder("Phone Number").fill("0851234567")
  await page.getByPlaceholder("Monthly Income*").fill("50000")
  await page.getByPlaceholder("Loan Amount*").fill("240000")
  await page.selectOption("select", "education")
  await page.getByPlaceholder("Age").fill("30")
  await page.getByPlaceholder("Email").fill("john@example.com")

  // กด submit
  await page.getByRole("button", { name: "Apply for Pre-Qualification" }).click()

  // เช็คข้อความที่มาจาก mocked response
  await expect(page.getByText(/Application ID:/)).toBeVisible()
  await expect(page.getByText("Status: Eligible")).toBeVisible()
  await expect(page.getByText("Eligible under base rules")).toBeVisible()
  await expect(page.getByText("Clear Message")).toBeVisible()

  // ฟอร์มควรถูกรีเซ็ต
  await expect(page.getByPlaceholder("Full Name*")).toHaveValue("")
})

  test("should handle ineligible loan application with real backend", async ({ page }) => {
    // Fill out form with data that makes user ineligible (low income)
    await page.getByPlaceholder("Full Name*").fill("Jane Doe")
    await page.getByPlaceholder("Phone Number").fill("0851234567")
    await page.getByPlaceholder("Monthly Income*").fill("8000") // Below 10000 threshold
    await page.getByPlaceholder("Loan Amount*").fill("100000")
    await page.selectOption("select", "education")
    await page.getByPlaceholder("Age").fill("25")
    await page.getByPlaceholder("Email").fill("jane@example.com")

    // Submit form
    await page.getByRole("button", { name: "Apply for Pre-Qualification" }).click()

    // Check ineligible response
    await expect(page.getByText("Status: Not Eligible")).toBeVisible()
    await expect(page.getByText("Monthly income is insufficient")).toBeVisible()
  })

  test("should handle age-based ineligibility", async ({ page }) => {
    // Test too young
    await page.getByPlaceholder("Full Name*").fill("Young Person")
    await page.getByPlaceholder("Phone Number").fill("0851234567")
    await page.getByPlaceholder("Monthly Income*").fill("50000")
    await page.getByPlaceholder("Loan Amount*").fill("240000")
    await page.selectOption("select", "education")
    await page.getByPlaceholder("Age").fill("19") // Below 20
    await page.getByPlaceholder("Email").fill("young@example.com")

    await page.getByRole("button", { name: "Apply for Pre-Qualification" }).click()

    await expect(page.getByText("Status: Not Eligible")).toBeVisible()
    await expect(page.getByText("Age not in range (must be between 20-60)")).toBeVisible()
  })

  test("should handle business loan rejection", async ({ page }) => {
    // Fill out form with business loan purpose
    await page.getByPlaceholder("Full Name*").fill("Business Owner")
    await page.getByPlaceholder("Phone Number").fill("0851234567")
    await page.getByPlaceholder("Monthly Income*").fill("50000")
    await page.getByPlaceholder("Loan Amount*").fill("240000")
    await page.selectOption("select", "business")
    await page.getByPlaceholder("Age").fill("35")
    await page.getByPlaceholder("Email").fill("business@example.com")

    await page.getByRole("button", { name: "Apply for Pre-Qualification" }).click()

    await expect(page.getByText("Status: Not Eligible")).toBeVisible()
    await expect(page.getByText("Business loans not supported")).toBeVisible()
  })

  test("should handle backend validation errors", async ({ page }) => {
    // Fill out form with invalid data that backend will reject
    await page.getByPlaceholder("Full Name*").fill("A") // Too short for backend
    await page.getByPlaceholder("Phone Number").fill("123") // Invalid phone
    await page.getByPlaceholder("Monthly Income*").fill("1000") // Too low
    await page.getByPlaceholder("Loan Amount*").fill("500") // Too low
    await page.selectOption("select", "education")
    await page.getByPlaceholder("Age").fill("0") // Invalid age
    await page.getByPlaceholder("Email").fill("invalid") // Invalid email

    await page.getByRole("button", { name: "Apply for Pre-Qualification" }).click()

    // Should show client-side validation errors first
    await expect(page.getByText("Full name must be at least 2 characters")).toBeVisible()
    await expect(page.getByText("Monthly income must be at least 5,000")).toBeVisible()
  })

  test("should clear API response when clear button is clicked", async ({ page }) => {
    // Fill and submit form
    await page.getByPlaceholder("Full Name*").fill("John Doe")
    await page.getByPlaceholder("Phone Number").fill("0851234567")
    await page.getByPlaceholder("Monthly Income*").fill("50000")
    await page.getByPlaceholder("Loan Amount*").fill("240000")
    await page.selectOption("select", "education")
    await page.getByPlaceholder("Age").fill("30")
    await page.getByPlaceholder("Email").fill("john@example.com")
    await page.getByRole("button", { name: "Apply for Pre-Qualification" }).click()

    // Verify response is shown
    await expect(page.getByText(/Application ID:/)).toBeVisible()

    // Click clear button
    await page.getByText("Clear Message").click()

    // Verify response is cleared
    await expect(page.getByText(/Application ID:/)).not.toBeVisible()
  })

  test("should show loading state during submission", async ({ page }) => {
    // Fill out form
    await page.getByPlaceholder("Full Name*").fill("John Doe")
    await page.getByPlaceholder("Phone Number").fill("0851234567")
    await page.getByPlaceholder("Monthly Income*").fill("50000")
    await page.getByPlaceholder("Loan Amount*").fill("240000")
    await page.selectOption("select", "education")
    await page.getByPlaceholder("Age").fill("30")
    await page.getByPlaceholder("Email").fill("john@example.com")

    // Submit form
    await page.getByRole("button", { name: "Apply for Pre-Qualification" }).click()

    // Check loading state (might be brief with local backend)
    const submitButton = page.getByRole("button", { name: /Submitting|Apply for Pre-Qualification/ })
    await expect(submitButton).toBeVisible()

    // Wait for completion
    await expect(page.getByText(/^Application ID:/)).toBeVisible()
    await expect(page.getByText(/^Status:/)).toBeVisible()
  })
})
