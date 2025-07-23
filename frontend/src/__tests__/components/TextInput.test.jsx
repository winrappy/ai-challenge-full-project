// "use client"

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import TextInput from "../../components/TextInput"

describe("TextInput Component", () => {
  const getDefaultProps = (overrides = {}) => ({
    id: "test-input",
    label: "Test Label",
    value: "",
    onChange: jest.fn(),
    error: "",
    disabled: false,
    ...overrides,
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renders input with label as placeholder", () => {
    render(<TextInput {...getDefaultProps()} />)
    expect(screen.getByPlaceholderText("Test Label")).toBeInTheDocument()
  })

  test("renders input with custom placeholder", () => {
    render(
      <TextInput {...getDefaultProps({ placeholder: "Custom Placeholder" })} />
    )
    expect(
      screen.getByPlaceholderText("Custom Placeholder")
    ).toBeInTheDocument()
  })

  test("calls onChange when user types", async () => {
    const user = userEvent.setup()
    const mockOnChange = jest.fn()

    render(<TextInput {...getDefaultProps({ onChange: mockOnChange })} />)

    const input = screen.getByPlaceholderText("Test Label")
    await user.type(input, "test value")

    expect(mockOnChange).toHaveBeenCalledTimes("test value".length)
    expect(mockOnChange.mock.calls.map((call) => call[0])).toEqual([
      "t",
      "e",
      "s",
      "t",
      " ",
      "v",
      "a",
      "l",
      "u",
      "e",
    ])
  })

  test("displays error message and applies error styling", () => {
    render(
      <TextInput {...getDefaultProps({ error: "This field is required" })} />
    )
    expect(screen.getByText("This field is required")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Test Label")).toHaveClass(
      "border-red-500"
    )
  })

  test('renders phone icon when icon prop is "phone"', () => {
    render(<TextInput {...getDefaultProps({ icon: "phone" })} />)

    const iconContainer = screen.getByTestId("phone-icon")
    expect(iconContainer).toBeInTheDocument()
  })

  test("applies correct input type", () => {
    render(<TextInput {...getDefaultProps({ type: "email" })} />)
    expect(screen.getByPlaceholderText("Test Label")).toHaveAttribute(
      "type",
      "email"
    )
  })

  test("applies min and max length attributes", () => {
    render(<TextInput {...getDefaultProps({ min: 2, max: 50 })} />)
    const input = screen.getByPlaceholderText("Test Label")
    expect(input).toHaveAttribute("minLength", "2")
    expect(input).toHaveAttribute("maxLength", "50")
  })

  test("disables input when disabled prop is true", () => {
    render(<TextInput {...getDefaultProps({ disabled: true })} />)
    expect(screen.getByPlaceholderText("Test Label")).toBeDisabled()
  })
})
