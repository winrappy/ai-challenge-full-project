package loaninquiry

import "time"

type LoanApplicationEntity struct {
	TotalCount    int       `db:"total_count"`
	ApplicationId string    `db:"application_id"`
	FullName      string    `db:"full_name"`
	MonthlyIncome int       `db:"monthly_income"`
	LoanAmount    int       `db:"loan_amount"`
	LoanPurpose   string    `db:"loan_purpose"`
	Age           int       `db:"age"`
	PhoneNumber   string    `db:"phone_number"`
	Email         string    `db:"email"`
	Timestamp     time.Time `db:"timestamp"`
}
