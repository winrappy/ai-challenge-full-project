"use client"

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import CurrencyInput from "../../components/CurrencyInput"

describe("CurrencyInput Component", () => {
  const defaultProps = {
    id: "currency-input",
    label: "Amount",
    value: "",
    onChange: jest.fn(),
    error: "",
    disabled: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renders currency input with dollar sign by default", () => {
    render(<CurrencyInput {...defaultProps} />)

    expect(screen.getByText("$")).toBeInTheDocument()
    expect(screen.getByTestId("currency-input")).toBeInTheDocument()
  })

  test("hides dollar sign when showDollarSign is false", () => {
    render(<CurrencyInput {...defaultProps} showDollarSign={false} />)

    expect(screen.queryByText("$")).not.toBeInTheDocument()
  })

  test("calls onChange when user enters a number", async () => {
    const user = userEvent.setup()
    let value = ""
    const handleChange = (val) => {
      value = val
      mockOnChange(val)
      rerender(
        <CurrencyInput
          {...defaultProps}
          value={value}
          onChange={handleChange}
        />
      )
    }
    const mockOnChange = jest.fn()

    const { rerender } = render(
      <CurrencyInput {...defaultProps} value={value} onChange={handleChange} />
    )

    const input = screen.getByTestId("currency-input")
    await user.type(input, "1000")

    expect(mockOnChange).toHaveBeenCalledTimes(4)
    expect(mockOnChange.mock.calls.map((call) => call[0])).toEqual([
      "1",
      "10",
      "100",
      "1000",
    ])
    expect(mockOnChange.mock.calls.at(-1)?.[0]).toBe("1000")
  })

  test("displays error message and applies error styling", () => {
    render(<CurrencyInput {...defaultProps} error="Amount is required" />)

    expect(screen.getByText("Amount is required")).toBeInTheDocument()
    expect(screen.getByTestId("currency-input")).toHaveClass("border-red-500")
  })

  test("applies min and max attributes", () => {
    render(<CurrencyInput {...defaultProps} min={1000} max={5000000} />)

    const input = screen.getByTestId("currency-input")
    expect(input).toHaveAttribute("min", "1000")
    expect(input).toHaveAttribute("max", "5000000")
  })

  test("has number input type", () => {
    render(<CurrencyInput {...defaultProps} />)

    const input = screen.getByTestId("currency-input")
    expect(input).toHaveAttribute("type", "number")
  })

  test("disables input when disabled prop is true", () => {
    render(<CurrencyInput {...defaultProps} disabled={true} />)

    const input = screen.getByTestId("currency-input")
    expect(input).toBeDisabled()
  })
})
