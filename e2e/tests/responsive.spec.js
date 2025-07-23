import { test, expect } from "@playwright/test"

test.describe("Responsive Design", () => {
  test("should display correctly on mobile devices", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto("/")

    // Check that form is still visible and usable
    await expect(page.getByText("ArisePreQ")).toBeVisible()
    await expect(page.getByPlaceholder("Full Name*")).toBeVisible()
    await expect(page.getByRole("button", { name: "Apply for Pre-Qualification" })).toBeVisible()
    

    // Test form interaction on mobile
    await page.getByPlaceholder("Full Name*").fill("John Doe")
    await page.getByPlaceholder("Phone Number").fill("0851234567")

    // Check that fields are properly sized
    const fullNameField = page.getByPlaceholder("Full Name*")
    const boundingBox = await fullNameField.boundingBox()
    expect(boundingBox.width).toBeGreaterThan(200) // Should be reasonably wide
  })

  test("should display correctly on tablet devices", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto("/")

    // Check layout on tablet
    await expect(page.getByText("ArisePreQ")).toBeVisible()
    const heading = page.locator('h2').filter({ hasText: 'Loan Pre-Qualification' })
    await expect(heading).toBeVisible()

    // Form should be centered and properly sized
    const form = page.locator("form")
    await expect(form).toBeVisible()
  })

  test("should display correctly on desktop", async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto("/")

    // Check desktop layout
    await expect(page.getByText("ArisePreQ")).toBeVisible()
    await expect(page.getByText("Get instant loan pre-qualification decisions.")).toBeVisible()

    // Form should be centered with proper max-width
    const formContainer = page.locator("div").filter({ hasText: "Loan Pre-Qualification Application" }).first()
    await expect(formContainer).toBeVisible()
  })
})
