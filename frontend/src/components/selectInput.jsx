"use client"

export default function SelectInput({
  id,
  value,
  onChange,
  options,
  disabled,
  error,
}) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <select
          id={id}
          value={value}
          data-testid={id}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-4 pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none ${
            value === "" ? "text-cyan-800" : "text-black"
          } ${error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""}`}
          disabled={disabled}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500 pointer-events-none">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error && <p className="text-red-500 text-xs ml-1">{error}</p>}
    </div>
  )
}
