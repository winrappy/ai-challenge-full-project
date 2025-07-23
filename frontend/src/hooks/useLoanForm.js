"use client"

import { useState, useCallback } from "react"
import { INITIAL_FORM_DATA, LOAN_PURPOSE_OPTIONS } from "../constants"
import { BASE_URL } from "../config"

export function useLoanForm() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiResponse, setApiResponse] = useState(null)

  const clearApiResponse = useCallback(() => setApiResponse(null), [])
  const handleInputChange = useCallback(
    (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
      if (apiResponse) clearApiResponse()
    },
    [apiResponse, clearApiResponse, errors]
  )

  const validateFullName = (name) => {
    if (!name.trim()) return "Full name is required"
    if (name.length < 2) return "Full name must be at least 2 characters"
    if (name.length > 255) return "Full name must not exceed 255 characters"
    return ""
  }

  const validateMonthlyIncome = (income) => {
    if (!income.trim()) return "Monthly income is required"
    const num = Number.parseFloat(income)
    if (isNaN(num) || num <= 0) return "Please enter a valid income amount"
    if (num < 5000) return "Monthly income must be at least 5,000"
    if (num > 5000000) return "Monthly income must not exceed 5,000,000"
    return ""
  }

  const validateLoanAmount = (amount) => {
    if (!amount.trim()) return "Loan amount is required"
    const num = Number.parseFloat(amount)
    if (isNaN(num) || num <= 0) return "Please enter a valid loan amount"
    if (num < 1000) return "Loan amount must be at least 1,000"
    if (num > 5000000) return "Loan amount must not exceed 5,000,000"
    return ""
  }

  const validateLoanPurpose = (purpose) => {
    if (!purpose.trim()) return "Loan purpose is required"
    const validPurposes = LOAN_PURPOSE_OPTIONS.map((opt) => opt.value).filter(
      Boolean
    )
    if (!validPurposes.includes(purpose))
      return "Please select a valid loan purpose"
    return ""
  }

  const validateAge = (age) => {
    if (!age.trim()) return "Age is required"
    const num = Number.parseInt(age, 10)
    if (isNaN(num) || num <= 0) return "Age must be a number greater than 0"
    return ""
  }

  const validatePhoneNumber = (phone) => {
    if (!phone.trim()) return "Phone number is required"
    const digits = phone.replace(/\D/g, "")
    if (digits.length !== 10 || !/^\d{10}$/.test(digits)) {
      return "Phone number must be exactly 10 digits and contain only numbers 0-9"
    }
    return ""
  }

  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Please enter a valid email address"
    return ""
  }

  // Run all validations, set errors, return boolean valid
  const validateForm = useCallback(() => {
    const newErrors = {
      fullName: validateFullName(formData.fullName),
      monthlyIncome: validateMonthlyIncome(formData.monthlyIncome),
      loanAmount: validateLoanAmount(formData.loanAmount),
      loanPurpose: validateLoanPurpose(formData.loanPurpose),
      age: validateAge(formData.age),
      phoneNumber: validatePhoneNumber(formData.phoneNumber),
      email: validateEmail(formData.email),
    }

    // Remove empty errors
    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) delete newErrors[key]
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      if (!validateForm()) {
        setApiResponse(null)
        return
      }

      setIsSubmitting(true)
      setApiResponse(null)

      try {
        const apiUrl = BASE_URL
        const payload = {
          ...formData,
          monthlyIncome: Number.parseFloat(formData.monthlyIncome),
          loanAmount: Number.parseFloat(formData.loanAmount),
          age: Number.parseInt(formData.age, 10),
        }

        const response = await fetch(`${apiUrl}/api/v1/loans`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        const data = await response.json()

        if (response.ok) {
          setApiResponse({ success: true, data })
          setFormData(INITIAL_FORM_DATA)
          console.log("API Response:", data)
        } else {
          setApiResponse({
            success: false,
            error: data.reason || data.message || "Unknown error",
          })
          console.error("API Error:", data)
        }
      } catch (error) {
        setApiResponse({
          success: false,
          error: "Network error or unable to connect to server.",
        })
        console.error("Submission error:", error)
      } finally {
        setIsSubmitting(false)
      }
    },
    [formData, validateForm]
  )

  return {
    formData,
    errors,
    isSubmitting,
    apiResponse,
    handleInputChange,
    handleSubmit,
    clearApiResponse,
  }
}
