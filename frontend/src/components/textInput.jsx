"use client"

export default function TextInput({
  id,
  label,
  value,
  onChange,
  error,
  disabled,
  type = "text",
  placeholder = "",
  min,
  max,
  icon,
}) {
  return (
    <div className="space-y-2">
      <div className="relative">
        {icon === "phone" && (
          <div className="absolute left-4 top-5/11 transform -translate-y-1/3 text-blue-500">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              data-testid="phone-icon"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
        )}
        <div className="flex">
          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || label}
            data-testid={id}
            minLength={min}
            maxLength={max}
            disabled={disabled}
            className={`w-full ${
              icon === "phone" ? "pl-12" : "pl-4"
            } pr-4 py-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-cyan-800 text-gray-700 ${
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : ""
            }`}
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-xs ml-1">{error}</p>}
    </div>
  )
}
