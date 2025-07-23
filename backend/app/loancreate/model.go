package loancreate

// ======= sample request ======== //
// {
// 	"fullName": "Somkanit Jitsanook",
// 	"monthlyIncome": 5000,
// 	"loanAmount": 10000,
// 	"loanPurpose": "home",
// 	"age": 25,
// 	"phoneNumber": "0851234567",
// 	"email": "demo@example.com"
// }

type HttpRequest struct {
	FullName      string `json:"fullName"`
	MonthlyIncome int    `json:"monthlyIncome"`
	LoanAmount    int    `json:"loanAmount"`
	LoanPurpose   string `json:"loanPurpose"`
	Age           int    `json:"age"`
	PhoneNumber   string `json:"phoneNumber"`
	Email         string `json:"email"`
}

// ======== sample response ======== //
// {
// 	"applicationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
// 	"eligible": true,
// 	"reason": "Eligible under base rules",
// 	"timestamp": "2025-07-19T19:34:56+07:00"
// }

type HttpResponse struct {
	ApplicationId string `json:"applicationId"`
	Eligible      bool   `json:"eligible"`
	Reason        string `json:"reason"`
	Timestamp     string `json:"timestamp"`
}

type HttpBadResponse struct {
	Message string `json:"message"`
	Reason  string `json:"reason"`
}
