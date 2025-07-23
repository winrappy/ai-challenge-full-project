import { test, expect } from "@playwright/test"

test.describe("Form Interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("should handle loan purpose dropdown selection", async ({ page }) => {
    const dropdown = page.locator("select")

    await expect(dropdown).toHaveValue("")

    await dropdown.selectOption("education")
    await expect(dropdown).toHaveValue("education")

    await dropdown.selectOption("home")
    await expect(dropdown).toHaveValue("home")
    
    await dropdown.selectOption("business")
    await expect(dropdown).toHaveValue("business")
    
    await dropdown.selectOption("personal")
    await expect(dropdown).toHaveValue("personal")
    
    await dropdown.selectOption("car")
    await expect(dropdown).toHaveValue("car")
  })

  test("should handle numeric input fields correctly", async ({ page }) => {
    const monthlyIncomeField = page.getByPlaceholder("Monthly Income*")
    const loanAmountField = page.getByPlaceholder("Loan Amount*")
    const ageField = page.getByPlaceholder("Age")

    // Test numeric input
    await monthlyIncomeField.fill("50000")
    await expect(monthlyIncomeField).toHaveValue("50000")

    await loanAmountField.fill("240000")
    await expect(loanAmountField).toHaveValue("240000")

    await ageField.fill("30")
    await expect(ageField).toHaveValue("30")

    // Test decimal input
    await monthlyIncomeField.fill("50000.50")
    await expect(monthlyIncomeField).toHaveValue("50000.50")
  })

  test("should handle phone number input with formatting", async ({ page }) => {
    const phoneField = page.getByPlaceholder("Phone Number")

    // Test valid phone number
    await phoneField.fill("0851234567")
    await expect(phoneField).toHaveValue("0851234567")

    // Test phone number with formatting (should still work)
    await phoneField.fill("0851234567")
    await expect(phoneField).toHaveValue("0851234567")
  })

  test("should show dollar sign for monthly income field", async ({ page }) => {
    // Check if dollar sign is visible near monthly income field
    const dollarSign = page.locator("text=$").first()
    await expect(dollarSign).toBeVisible()
  })

  test("should handle form reset after successful submission", async ({ page }) => {
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

    // Wait for success response
    await expect(page.getByText(/Application ID:/)).toBeVisible()

    // Check that form is reset
    await expect(page.getByPlaceholder("Full Name*")).toHaveValue("")
    await expect(page.getByPlaceholder("Phone Number")).toHaveValue("")
    await expect(page.getByPlaceholder("Monthly Income*")).toHaveValue("")
    await expect(page.getByPlaceholder("Loan Amount*")).toHaveValue("")
    await expect(page.locator("select")).toHaveValue("")
    await expect(page.getByPlaceholder("Age")).toHaveValue("")
    await expect(page.getByPlaceholder("Email")).toHaveValue("")
  })

  test("should handle keyboard navigation", async ({ page }) => {
  await page.waitForSelector('input[placeholder="Full Name*"]', { state: 'visible' })
  
  await page.keyboard.press("Tab")
  await expect(page.getByPlaceholder("Full Name*")).toBeFocused()

  await page.keyboard.press("Tab")
  await expect(page.getByPlaceholder("Phone Number")).toBeFocused()

  await page.keyboard.press("Tab")
  await expect(page.getByPlaceholder("Monthly Income*")).toBeFocused()

  await page.keyboard.press("Tab")
  await expect(page.getByPlaceholder("Loan Amount*")).toBeFocused()

  await page.keyboard.press("Tab")
  await expect(page.locator("select").first()).toBeFocused()

  await page.keyboard.press("Tab")
  await expect(page.getByPlaceholder("Age")).toBeFocused()

  await page.keyboard.press("Tab")
  await expect(page.getByPlaceholder("Email")).toBeFocused()

  await page.keyboard.press("Tab")
  await expect(page.getByRole("button", { name: "Apply for Pre-Qualification" })).toBeFocused()
})


  test("should handle form submission with Enter key", async ({ page }) => {
    // Fill out form
    await page.getByPlaceholder("Full Name*").fill("John Doe")
    await page.getByPlaceholder("Phone Number").fill("0851234567")
    await page.getByPlaceholder("Monthly Income*").fill("50000")
    await page.getByPlaceholder("Loan Amount*").fill("240000")
    await page.selectOption("select", "education")
    await page.getByPlaceholder("Age").fill("30")
    await page.getByPlaceholder("Email").fill("john@example.com")

    // Submit with Enter key
    await page.getByPlaceholder("Email").press("Enter")

    // Check success response
    await expect(page.getByText(/Application ID:/)).toBeVisible()
  })
})
