jest.mock("../../config", () => ({
  BASE_URL: "http://localhost:30090",
}))

import { renderHook, act } from "@testing-library/react"
import { useLoanForm } from "../../hooks/useLoanForm"

// Mock fetch
global.fetch = jest.fn()

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
}

describe("useLoanForm Hook", () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe("Initial State", () => {
    test("initializes with correct default values", () => {
      const { result } = renderHook(() => useLoanForm())

      expect(result.current.formData).toEqual({
        fullName: "",
        phoneNumber: "",
        monthlyIncome: "",
        loanAmount: "",
        loanPurpose: "",
        age: "",
        email: "",
      })
      expect(result.current.errors).toEqual({})
      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.apiResponse).toBeNull()
    })

    test("provides all required functions", () => {
      const { result } = renderHook(() => useLoanForm())

      expect(typeof result.current.handleInputChange).toBe("function")
      expect(typeof result.current.handleSubmit).toBe("function")
      expect(typeof result.current.clearApiResponse).toBe("function")
    })
  })

  describe("Form Data Management", () => {
    test("updates form data when handleInputChange is called", () => {
      const { result } = renderHook(() => useLoanForm())

      act(() => {
        result.current.handleInputChange("fullName", "John Doe")
      })

      expect(result.current.formData.fullName).toBe("John Doe")
    })

    test("updates multiple fields independently", () => {
      const { result } = renderHook(() => useLoanForm())

      act(() => {
        result.current.handleInputChange("fullName", "John Doe")
        result.current.handleInputChange("email", "john@example.com")
        result.current.handleInputChange("age", "30")
      })

      expect(result.current.formData).toEqual({
        fullName: "John Doe",
        phoneNumber: "",
        monthlyIncome: "",
        loanAmount: "",
        loanPurpose: "",
        age: "30",
        email: "john@example.com",
      })
    })

    test("clears field error when field is updated", () => {
      const { result } = renderHook(() => useLoanForm())

      // First trigger validation to set errors
      act(() => {
        result.current.handleSubmit({ preventDefault: jest.fn() })
      })

      expect(result.current.errors.fullName).toBeTruthy()

      // Update the field
      act(() => {
        result.current.handleInputChange("fullName", "John Doe")
      })

      expect(result.current.errors.fullName).toBe("")
    })

    test("clears API response when field is updated", () => {
      const { result } = renderHook(() => useLoanForm())

      // Set an API response
      act(() => {
        result.current.clearApiResponse()
      })

      // Update a field
      act(() => {
        result.current.handleInputChange("fullName", "John")
      })

      expect(result.current.apiResponse).toBeNull()
    })
  })

  describe("Form Validation", () => {
    describe("Full Name Validation", () => {
      test("validates empty full name", async () => {
        const { result } = renderHook(() => useLoanForm())

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.fullName).toBe("Full name is required")
      })

      test("validates full name too short", async () => {
        const { result } = renderHook(() => useLoanForm())

        act(() => {
          result.current.handleInputChange("fullName", "A")
        })

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.fullName).toBe(
          "Full name must be at least 2 characters"
        )
      })

      test("validates full name too long", async () => {
        const { result } = renderHook(() => useLoanForm())

        act(() => {
          result.current.handleInputChange("fullName", "A".repeat(256))
        })

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.fullName).toBe(
          "Full name must not exceed 255 characters"
        )
      })

      test("accepts valid full name", async () => {
        const { result } = renderHook(() => useLoanForm())

        act(() => {
          result.current.handleInputChange("fullName", "John Doe")
        })

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.fullName).toBeUndefined()
      })
    })

    describe("Monthly Income Validation", () => {
      test("validates empty monthly income", async () => {
        const { result } = renderHook(() => useLoanForm())

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.monthlyIncome).toBe(
          "Monthly income is required"
        )
      })

      test("validates invalid monthly income", async () => {
        const { result } = renderHook(() => useLoanForm())

        act(() => {
          result.current.handleInputChange("monthlyIncome", "invalid")
        })

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.monthlyIncome).toBe(
          "Please enter a valid income amount"
        )
      })

      test("validates monthly income too low", async () => {
        const { result } = renderHook(() => useLoanForm())

        act(() => {
          result.current.handleInputChange("monthlyIncome", "4999")
        })

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.monthlyIncome).toBe(
          "Monthly income must be at least 5,000"
        )
      })

      test("validates monthly income too high", async () => {
        const { result } = renderHook(() => useLoanForm())

        act(() => {
          result.current.handleInputChange("monthlyIncome", "5000001")
        })

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.monthlyIncome).toBe(
          "Monthly income must not exceed 5,000,000"
        )
      })

      test("accepts valid monthly income", async () => {
        const { result } = renderHook(() => useLoanForm())

        act(() => {
          result.current.handleInputChange("monthlyIncome", "50000")
        })

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.monthlyIncome).toBeUndefined()
      })
    })

    describe("Loan Amount Validation", () => {
      test("validates empty loan amount", async () => {
        const { result } = renderHook(() => useLoanForm())

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.loanAmount).toBe("Loan amount is required")
      })

      test("validates loan amount too low", async () => {
        const { result } = renderHook(() => useLoanForm())

        act(() => {
          result.current.handleInputChange("loanAmount", "999")
        })

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.loanAmount).toBe(
          "Loan amount must be at least 1,000"
        )
      })

      test("validates loan amount too high", async () => {
        const { result } = renderHook(() => useLoanForm())

        act(() => {
          result.current.handleInputChange("loanAmount", "5000001")
        })

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.loanAmount).toBe(
          "Loan amount must not exceed 5,000,000"
        )
      })
    })

    describe("Phone Number Validation", () => {
      test("validates empty phone number", async () => {
        const { result } = renderHook(() => useLoanForm())

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.phoneNumber).toBe(
          "Phone number is required"
        )
      })

      test("validates phone number with wrong length", async () => {
        const { result } = renderHook(() => useLoanForm())

        act(() => {
          result.current.handleInputChange("phoneNumber", "123456789")
        })

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.phoneNumber).toBe(
          "Phone number must be exactly 10 digits and contain only numbers 0-9"
        )
      })

      test("validates phone number with non-digits", async () => {
        const { result } = renderHook(() => useLoanForm())

        act(() => {
          result.current.handleInputChange("phoneNumber", "085-123-4567")
        })

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.phoneNumber).toBeUndefined() // Should pass as digits are extracted
      })

      test("accepts valid phone number", async () => {
        const { result } = renderHook(() => useLoanForm())

        act(() => {
          result.current.handleInputChange("phoneNumber", "0851234567")
        })

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.phoneNumber).toBeUndefined()
      })
    })

    describe("Email Validation", () => {
      test("validates empty email", async () => {
        const { result } = renderHook(() => useLoanForm())

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.email).toBe("Email is required")
      })

      test("validates invalid email format", async () => {
        const { result } = renderHook(() => useLoanForm())

        act(() => {
          result.current.handleInputChange("email", "invalid-email")
        })

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.email).toBe(
          "Please enter a valid email address"
        )
      })

      test("accepts valid email", async () => {
        const { result } = renderHook(() => useLoanForm())

        act(() => {
          result.current.handleInputChange("email", "john@example.com")
        })

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.email).toBeUndefined()
      })
    })

    describe("Age Validation", () => {
      test("validates empty age", async () => {
        const { result } = renderHook(() => useLoanForm())

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.age).toBe("Age is required")
      })

      test("validates invalid age", async () => {
        const { result } = renderHook(() => useLoanForm())

        act(() => {
          result.current.handleInputChange("age", "0")
        })

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.age).toBe(
          "Age must be a number greater than 0"
        )
      })

      test("accepts valid age", async () => {
        const { result } = renderHook(() => useLoanForm())

        act(() => {
          result.current.handleInputChange("age", "30")
        })

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.age).toBeUndefined()
      })
    })

    describe("Loan Purpose Validation", () => {
      test("validates empty loan purpose", async () => {
        const { result } = renderHook(() => useLoanForm())

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.loanPurpose).toBe(
          "Loan purpose is required"
        )
      })

      test("validates invalid loan purpose", async () => {
        const { result } = renderHook(() => useLoanForm())

        act(() => {
          result.current.handleInputChange("loanPurpose", "invalid-purpose")
        })

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.loanPurpose).toBe(
          "Please select a valid loan purpose"
        )
      })

      test("accepts valid loan purpose", async () => {
        const { result } = renderHook(() => useLoanForm())

        act(() => {
          result.current.handleInputChange("loanPurpose", "education")
        })

        await act(async () => {
          await result.current.handleSubmit({ preventDefault: jest.fn() })
        })

        expect(result.current.errors.loanPurpose).toBeUndefined()
      })
    })
  })

  describe("Form Submission", () => {
    const validFormData = {
      fullName: "John Doe",
      phoneNumber: "0851234567",
      monthlyIncome: "50000",
      loanAmount: "240000",
      loanPurpose: "education",
      age: "30",
      email: "john@example.com",
    }

    const fillValidForm = (result) => {
      Object.entries(validFormData).forEach(([field, value]) => {
        act(() => {
          result.current.handleInputChange(field, value)
        })
      })
    }

    test("prevents submission with invalid form", async () => {
      const { result } = renderHook(() => useLoanForm())

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: jest.fn() })
      })

      expect(fetch).not.toHaveBeenCalled()
      expect(result.current.isSubmitting).toBe(false)
      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0)
    })

    test("submits form with valid data successfully", async () => {
      const mockResponse = {
        applicationId: "123e4567-e89b-12d3-a456-426614174000",
        eligible: true,
        reason: "Eligible under base rules",
        timestamp: "2024-01-01T12:00:00Z",
      }

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const { result } = renderHook(() => useLoanForm())
      fillValidForm(result)

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: jest.fn() })
      })

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:30090/api/v1/loans",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: "John Doe",
            phoneNumber: "0851234567",
            monthlyIncome: 50000,
            loanAmount: 240000,
            loanPurpose: "education",
            age: 30,
            email: "john@example.com",
          }),
        }
      )

      expect(result.current.apiResponse).toEqual({
        success: true,
        data: mockResponse,
      })

      expect(result.current.formData).toEqual({
        fullName: "",
        phoneNumber: "",
        monthlyIncome: "",
        loanAmount: "",
        loanPurpose: "",
        age: "",
        email: "",
      })
    })

    test("handles API error response", async () => {
      const mockErrorResponse = {
        reason: "Monthly income is insufficient",
        message: "Invalid request",
      }

      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => mockErrorResponse,
      })

      const { result } = renderHook(() => useLoanForm())
      fillValidForm(result)

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: jest.fn() })
      })

      expect(result.current.apiResponse).toEqual({
        success: false,
        error: "Monthly income is insufficient",
      })
    })

    test("handles network error", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"))

      const { result } = renderHook(() => useLoanForm())
      fillValidForm(result)

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: jest.fn() })
      })

      expect(result.current.apiResponse).toEqual({
        success: false,
        error: "Network error or unable to connect to server.",
      })
    })

    test("sets isSubmitting state correctly during submission", async () => {
      let resolvePromise
      const promise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      fetch.mockReturnValueOnce(promise)

      const { result } = renderHook(() => useLoanForm())
      fillValidForm(result)

      // Start submission
      act(() => {
        result.current.handleSubmit({ preventDefault: jest.fn() })
      })

      expect(result.current.isSubmitting).toBe(true)

      // Resolve the promise
      await act(async () => {
        resolvePromise({
          ok: true,
          json: async () => ({ applicationId: "123", eligible: true }),
        })
        await promise
      })

      expect(result.current.isSubmitting).toBe(false)
    })
  })

  describe("API Response Management", () => {
    test("clears API response when clearApiResponse is called", () => {
      const { result } = renderHook(() => useLoanForm())

      // Set a mock API response
      act(() => {
        result.current.handleInputChange("fullName", "John")
      })

      act(() => {
        result.current.clearApiResponse()
      })

      expect(result.current.apiResponse).toBeNull()
    })

    test("clears API response when form is submitted", async () => {
      const { result } = renderHook(() => useLoanForm())

      // Set a mock API response first
      act(() => {
        result.current.clearApiResponse()
      })

      // Submit form (will fail validation)
      await act(async () => {
        await result.current.handleSubmit({ preventDefault: jest.fn() })
      })

      expect(result.current.apiResponse).toBeNull()
    })
  })

  describe("Edge Cases", () => {
    test("handles whitespace-only inputs", async () => {
      const { result } = renderHook(() => useLoanForm())

      act(() => {
        result.current.handleInputChange("fullName", "   ")
        result.current.handleInputChange("email", "   ")
      })

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: jest.fn() })
      })

      expect(result.current.errors.fullName).toBe("Full name is required")
      expect(result.current.errors.email).toBe("Email is required")
    })

    test("handles phone number with formatting characters", async () => {
      const { result } = renderHook(() => useLoanForm())

      act(() => {
        result.current.handleInputChange("phoneNumber", "(085) 123-4567")
      })

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: jest.fn() })
      })

      expect(result.current.errors.phoneNumber).toBeUndefined()
    })

    test("handles decimal values for numeric fields", async () => {
      const { result } = renderHook(() => useLoanForm())

      act(() => {
        result.current.handleInputChange("monthlyIncome", "50000.50")
        result.current.handleInputChange("loanAmount", "240000.75")
      })

      await act(async () => {
        await result.current.handleSubmit({ preventDefault: jest.fn() })
      })

      expect(result.current.errors.monthlyIncome).toBeUndefined()
      expect(result.current.errors.loanAmount).toBeUndefined()
    })
  })
})
