package loaninquiry

const (
	EligibleUnderBaseRules       = "Eligible under base rules"
	ErrReasonApplicationNotFound = "applicationId not found: "
	ErrApplicationNotFound       = "Loan application not found"
	ErrNoRows                    = "no rows in result set"
)

const (
	ErrMonthlyIncomeInsufficient = "Monthly income is insufficient"
	ErrAgeNotInRange             = "Age not in range (must be between 20-60)"
	ErrBusinessLoansNotSupported = "Business loans not supported"
	ErrLoanAmountExceedsCap      = "Loan amount cannot exceed 12 months of income"
)
