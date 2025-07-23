// "use client"

import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SelectInput from "../../components/SelectInput"

describe("SelectInput Component", () => {
  const mockOptions = [
    { value: "", label: "Select option" },
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
  ]

  const getDefaultProps = (overrides = {}) => ({
    id: "select-input",
    value: "",
    onChange: jest.fn(),
    options: mockOptions,
    disabled: false,
    error: "",
    ...overrides,
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renders select with all options", () => {
    render(<SelectInput {...getDefaultProps()} />)

    expect(screen.getByDisplayValue("Select option")).toBeInTheDocument()
    expect(screen.getByText("Option 1")).toBeInTheDocument()
    expect(screen.getByText("Option 2")).toBeInTheDocument()
  })

  test("calls onChange when option is selected", async () => {
    const user = userEvent.setup()
    const mockOnChange = jest.fn()

    render(<SelectInput {...getDefaultProps({ onChange: mockOnChange })} />)

    const select = screen.getByDisplayValue("Select option")
    await user.selectOptions(select, "option1")

    expect(mockOnChange).toHaveBeenCalledWith("option1")
  })

  test("displays selected value", () => {
    render(<SelectInput {...getDefaultProps({ value: "option1" })} />)

    expect(screen.getByDisplayValue("Option 1")).toBeInTheDocument()
  })

  test("displays error message and applies error styling", () => {
    render(
      <SelectInput {...getDefaultProps({ error: "Please select an option" })} />
    )

    expect(screen.getByText("Please select an option")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Select option")).toHaveClass(
      "border-red-500"
    )
  })

  test("disables select when disabled prop is true", () => {
    render(<SelectInput {...getDefaultProps({ disabled: true })} />)

    expect(screen.getByDisplayValue("Select option")).toBeDisabled()
  })

  test("applies correct text color based on selection", () => {
    const { rerender } = render(
      <SelectInput {...getDefaultProps({ value: "" })} />
    )

    let select = screen.getByDisplayValue("Select option")
    expect(select).toHaveClass("text-cyan-800")

    rerender(<SelectInput {...getDefaultProps({ value: "option1" })} />)
    select = screen.getByDisplayValue("Option 1")
    expect(select).toHaveClass("text-black")
  })
})
