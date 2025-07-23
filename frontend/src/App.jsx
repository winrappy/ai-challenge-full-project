"use client"

import { useMemo, memo } from "react"
import { LOAN_PURPOSE_OPTIONS } from "./constants"
import { TextInput, CurrencyInput, SelectInput } from "./components"
import { useLoanForm } from "./hooks/useLoanForm" // Import the custom hook

const App = memo(() => {
  const {
    formData,
    errors,
    isSubmitting,
    apiResponse,
    handleInputChange,
    handleSubmit,
    clearApiResponse,
  } = useLoanForm()
  const buttonClassName = useMemo(
    () =>
      `w-full py-4 px-6 border-none rounded-xl font-semibold text-white text-lg transition-all duration-200 ${
        isSubmitting
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      }`,
    [isSubmitting]
  )

  // Memoize form fields to prevent unnecessary re-renders
  const formFields = useMemo(
    () => (
      <>
        <TextInput
          id="fullName"
          label="Full Name*"
          value={formData.fullName}
          onChange={(val) => handleInputChange("fullName", val)}
          error={errors.fullName}
          disabled={isSubmitting}
          max={255}
        />
        <TextInput
          id="phoneNumber"
          label="Phone Number*"
          type="tel"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={(val) => handleInputChange("phoneNumber", val)}
          error={errors.phoneNumber}
          disabled={isSubmitting}
          icon="phone"
          max={10}
        />
        <CurrencyInput
          id="monthlyIncome"
          label="Monthly Income*"
          value={formData.monthlyIncome}
          onChange={(val) => handleInputChange("monthlyIncome", val)}
          error={errors.monthlyIncome}
          disabled={isSubmitting}
          max={5000000}
        />
        <CurrencyInput
          id="loanAmount"
          label="Loan Amount*"
          value={formData.loanAmount}
          onChange={(val) => handleInputChange("loanAmount", val)}
          error={errors.loanAmount}
          disabled={isSubmitting}
          showDollarSign={false}
          max={5000000}
        />
        <SelectInput
          id="loanPurpose"
          label="Loan Purpose*"
          options={LOAN_PURPOSE_OPTIONS}
          value={formData.loanPurpose}
          onChange={(val) => handleInputChange("loanPurpose", val)}
          error={errors.loanPurpose}
          disabled={isSubmitting}
        />
        <TextInput
          id="age"
          label="Age*"
          type="number"
          placeholder="Age"
          value={formData.age}
          onChange={(val) => handleInputChange("age", val)}
          error={errors.age}
          disabled={isSubmitting}
          min={1}
        />
        <TextInput
          id="email"
          label="Email*"
          placeholder="Email"
          value={formData.email}
          onChange={(val) => handleInputChange("email", val)}
          error={errors.email}
          disabled={isSubmitting}
        />
      </>
    ),
    [formData, errors, isSubmitting, handleInputChange]
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-300 via-blue-400 to-blue-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-blue-100 bg-opacity-60 backdrop-blur-sm rounded-3xl px-8 py-4 shadow-xl">
          <header className="flex flex-col text-center">
            <h1 className="text-3xl m-1 font-bold text-blue-600">ArisePreQ</h1>
            <h2 className="text-2xl m-1 font-semibold text-gray-800">
              Loan Pre-Qualification
            </h2>
            <p className="text-gray-700 m-1 text-lg">
              Get instant loan pre-qualification decisions.
            </p>
          </header>
          <main className="relative bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 text-center m-1">
              Loan Pre-Qualification Application
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
              {formFields}
              {apiResponse && (
                <div
                  className={`p-4 rounded-xl text-center font-semibold ${
                    apiResponse.success
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {apiResponse.success ? (
                    <>
                      <p className="text-lg">
                        Application ID:{" "}
                        <strong>{apiResponse.data.applicationId}</strong>
                      </p>
                      <p className="text-xl mt-2">
                        Status:{" "}
                        <span
                          className={
                            apiResponse.data.eligible
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {apiResponse.data.eligible
                            ? "Eligible"
                            : "Not Eligible"}
                        </span>
                      </p>
                      <p className="text-sm mt-1">{apiResponse.data.reason}</p>
                    </>
                  ) : (
                    <p className="text-lg">Error: {apiResponse.error}</p>
                  )}
                  <button
                    type="button"
                    onClick={clearApiResponse}
                    className="mt-3 text-sm text-blue-600 hover:underline"
                  >
                    Clear Message
                  </button>
                </div>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={buttonClassName}
                tabIndex={0}
              >
                {isSubmitting ? "Submitting..." : "Apply for Pre-Qualification"}
              </button>
            </form>
          </main>
        </div>
      </div>
    </div>
  )
})

export default App
