package loaninquiry

import "time"

// ========= sample response inquiry ========= //
//
//	{
//		"applicationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
//		"fullName": "Somkanit Jitsanook",
//		"monthlyIncome": 5000,
//		"loanAmount": 10000,
//		"loanPurpose": "home",
//		"age": 25,
//		"phoneNumber": "0851234567",
//		"email": "demo@example.com",
//		"eligible": true,
//		"reason": "Eligible under base rules",
//		"timestamp": "2025-07-19T19:34:56+07:00"
//	}
type ApplicationResponse struct {
	ApplicationID string    `json:"applicationId"`
	FullName      string    `json:"fullName"`
	MonthlyIncome int       `json:"monthlyIncome"`
	LoanAmount    int       `json:"loanAmount"`
	LoanPurpose   string    `json:"loanPurpose"`
	Age           int       `json:"age"`
	PhoneNumber   string    `json:"phoneNumber"`
	Email         string    `json:"email"`
	Eligible      bool      `json:"eligible"`
	Reason        string    `json:"reason"`
	Timestamp     time.Time `json:"timestamp"`
}

type GetAllLoanApplicationResponse struct {
	Applications []ApplicationResponse `json:"applications"`
	Page         int                   `json:"page"`
	TotalPages   int                   `json:"totalPages"`
}

type ErrBadRequest struct {
	Message string `json:"message"`
	Reason  string `json:"reason"`
}
