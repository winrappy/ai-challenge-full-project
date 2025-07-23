package loancreate

const (
	MsgReasonSuccess = "Eligible under base rules"
	MsgInvalidBody   = "Invalid request body"
)

var (
	ErrMonthlyIncomeInsufficient = "Monthly income is insufficient"
	ErrAgeNotInRange             = "Age not in range (must be between 20-60)"
	ErrBusinessLoansNotSupported = "Business loans not supported"
	ErrLoanAmountExceedsCap      = "Loan amount cannot exceed 12 months of income"
)

var PurposeList = []string{"home", "car", "education", "personal", "business"}
