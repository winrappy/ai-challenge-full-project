"use client"

export default function CurrencyInput({
  id,
  label,
  value,
  onChange,
  error,
  disabled,
  showDollarSign = true,
  min,
  max,
}) {
  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="flex">
          {showDollarSign && (
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 translate-x-1/2 text-blue-500 font-semibold text-lg">
              $
            </span>
          )}
          <input
            id={id}
            type="number"
            value={value}
            data-testid={id}
            onChange={(e) => onChange(e.target.value)}
            placeholder={label}
            disabled={disabled}
            min={min}
            max={max}
            className={`w-full ${
              showDollarSign ? "pl-12" : "pl-4"
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
