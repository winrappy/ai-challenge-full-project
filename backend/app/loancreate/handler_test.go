package loancreate

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/mock"
	"gotest.tools/assert"
)

func Test_SUCCESS(t *testing.T) {
	mockRepo := NewMockRepo()
	s := NewService(mockRepo)
	h := NewHandler(s)

	mockRepo.On("CreateLoanApplication", mock.Anything, mock.Anything).Return(nil)

	mockRequestCase01 := HttpRequest{
		FullName:      "Somkanit Jitsanook",
		MonthlyIncome: 11000,
		LoanAmount:    120000,
		LoanPurpose:   "home",
		Age:           25,
		PhoneNumber:   "0851234567",
		Email:         "demo@example.com",
	}

	b1, err := json.Marshal(mockRequestCase01)
	if err != nil {
		panic("error: " + err.Error())
	}

	bodyCase01 := bytes.NewBufferString(string(b1))

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/api/v1/loan", h.LoansCreate)

	req := httptest.NewRequest(http.MethodPost, "http://0.0.0.0/api/v1/loan", bodyCase01)
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()
	r.ServeHTTP(resp, req)

	var response map[string]interface{}
	if err = json.Unmarshal(resp.Body.Bytes(), &response); err != nil {
		panic("error: " + err.Error())
	}

	messageExpected := MsgReasonSuccess

	// Assert
	assert.Equal(t, messageExpected, response["reason"])
}

func Test_Validate_Feild(t *testing.T) {
	mockService := NewMockService()
	h := NewHandler(mockService)

	mockService.On("CreateLoanApplication", mock.Anything, mock.Anything).Return("", "", nil)

	mockRequestCase01 := HttpRequest{
		FullName:      "Somkanit Jitsanook",
		MonthlyIncome: 5000,
		LoanAmount:    10000,
		LoanPurpose:   "home",
	}

	b1, err := json.Marshal(mockRequestCase01)
	if err != nil {
		panic("error: " + err.Error())
	}

	bodyCase01 := bytes.NewBufferString(string(b1))

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/api/v1/loan", h.LoansCreate)

	req := httptest.NewRequest(http.MethodPost, "http://0.0.0.0/api/v1/loan", bodyCase01)
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()
	r.ServeHTTP(resp, req)

	messageExpected := `{"message":"Invalid request body","reason":"missing required fields: age, phoneNumber, email"}`

	// Assert
	assert.Equal(t, messageExpected, resp.Body.String())
}

func Test_Validate_Email(t *testing.T) {
	mockService := NewMockService()
	h := NewHandler(mockService)

	mockService.On("CreateLoanApplication", mock.Anything, mock.Anything).Return("", "", nil)

	mockRequestCase := HttpRequest{
		FullName:      "Somkanit Jitsanook",
		MonthlyIncome: 5000,
		LoanAmount:    10000,
		LoanPurpose:   "home",
		Age:           25,
		PhoneNumber:   "0851234567",
		Email:         "demoexample.com",
	}

	b, err := json.Marshal(mockRequestCase)
	if err != nil {
		panic("error: " + err.Error())
	}

	bodyCase := bytes.NewBufferString(string(b))

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.POST("/api/v1/loan", h.LoansCreate)

	req := httptest.NewRequest(http.MethodPost, "http://0.0.0.0/api/v1/loan", bodyCase)
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()
	r.ServeHTTP(resp, req)

	messageExpected := `{"message":"Invalid request body","reason":"email must be a valid email"}`

	// Assert
	assert.Equal(t, messageExpected, resp.Body.String())
}
