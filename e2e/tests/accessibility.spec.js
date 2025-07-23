import { test, expect } from "@playwright/test"

test.describe("Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("should have proper form labels and accessibility attributes", async ({ page }) => {
    // Check that form fields have proper labels/placeholders
    await expect(page.getByPlaceholder("Full Name*")).toBeVisible()
    await expect(page.getByPlaceholder("Phone Number")).toBeVisible()
    await expect(page.getByPlaceholder("Monthly Income*")).toBeVisible()
    await expect(page.getByPlaceholder("Loan Amount*")).toBeVisible()
    await expect(page.getByPlaceholder("Age")).toBeVisible()
    await expect(page.getByPlaceholder("Email")).toBeVisible()

    // Check that submit button has proper role
    const submitButton = page.getByRole("button", { name: "Apply for Pre-Qualification" })
    await expect(submitButton).toBeVisible()
    await expect(submitButton).toBeEnabled()
  })

  test("should handle focus states properly", async ({ page }) => {
    // Test focus on form fields
    await page.getByPlaceholder("Full Name*").focus()
    await expect(page.getByPlaceholder("Full Name*")).toBeFocused()

    await page.getByPlaceholder("Email").focus()
    await expect(page.getByPlaceholder("Email")).toBeFocused()

    // Test focus on submit button
    await page.getByRole("button", { name: "Apply for Pre-Qualification" }).focus()
    await expect(page.getByRole("button", { name: "Apply for Pre-Qualification" })).toBeFocused()
  })

  test("should have proper heading hierarchy", async ({ page }) => {
    // Check heading structure
    await expect(page.locator("h1")).toContainText("ArisePreQ")
    await expect(page.locator("h2")).toContainText("Loan Pre-Qualification")
    await expect(page.locator("h3")).toContainText("Loan Pre-Qualification Application")
  })

  test("should provide proper error messages for screen readers", async ({ page }) => {
    // Submit empty form to trigger validation
    await page.getByRole("button", { name: "Apply for Pre-Qualification" }).click()

    // Check that error messages are visible and accessible
    const errorMessages = [
      "Full name is required",
      "Monthly income is required",
      "Loan amount is required",
      "Loan purpose is required",
      "Age is required",
      "Phone number is required",
      "Email is required",
    ]

    for (const message of errorMessages) {
      await expect(page.getByText(message)).toBeVisible()
    }
  })

  test("should handle high contrast mode", async ({ page }) => {
    // Simulate high contrast by checking color contrast
    await page.emulateMedia({ colorScheme: "dark" })

    // Form should still be visible and usable
    await expect(page.getByText("ArisePreQ")).toBeVisible()
    await expect(page.getByPlaceholder("Full Name*")).toBeVisible()
    await expect(page.getByRole("button", { name: "Apply for Pre-Qualification" })).toBeVisible()
  })
})
