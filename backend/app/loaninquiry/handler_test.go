package loaninquiry

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"gotest.tools/assert"
)

func TestGetLoanApplicationWithAppId(t *testing.T) {
	repo := NewMockRepo()
	s := NewService(repo)
	h := NewHandler(s)

	repo.On("GetLoanApplicationWithAppId", mock.Anything, mock.Anything).Return(LoanApplicationEntity{}, errors.New(ErrNoRows))

	gin.SetMode(gin.TestMode)
	r := gin.Default()
	r.GET("/api/v1/loans/:applicationId", h.GetLoanApplicationWithAppId)

	applicationId := uuid.New().String()

	req := httptest.NewRequest(http.MethodGet, "http://0.0.0.0/api/v1/loans/"+applicationId, nil)
	req.Header.Set("Content-Type", "application/json")
	resp := httptest.NewRecorder()
	r.ServeHTTP(resp, req)

	fmt.Println(resp.Body.String())

	var response map[string]interface{}
	if err := json.Unmarshal(resp.Body.Bytes(), &response); err != nil {
		panic("error: " + err.Error())
	}

	messageExpected := ErrApplicationNotFound

	// Assert
	assert.Equal(t, messageExpected, response["message"])
}
