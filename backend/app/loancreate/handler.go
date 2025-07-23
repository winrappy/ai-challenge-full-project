package loancreate

import (
	"errors"
	"log"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	services Service
}

func NewHandler(services Service) Handler {
	return Handler{
		services: services,
	}
}

func (h *Handler) LoansCreate(c *gin.Context) {

	var req HttpRequest
	if err := c.Bind(&req); err != nil {
		log.Println("err: ", err)
		c.JSON(http.StatusInternalServerError, HttpBadResponse{
			Message: MsgInvalidBody,
			Reason:  err.Error(),
		})
		return
	}

	if err := h.validateRequest(req); err != nil {
		log.Println("err: ", err)
		c.JSON(http.StatusBadRequest, HttpBadResponse{
			Message: MsgInvalidBody,
			Reason:  err.Error(),
		})
		return
	}

	applicationId, timestamp, err := h.services.CreateLoanApplication(c.Request.Context(), req)
	if err != nil {
		// Eligibility errors: return HTTP 200 with eligible: false
		c.JSON(http.StatusOK, HttpResponse{
			ApplicationId: applicationId,
			Eligible:      false,
			Reason:        err.Error(),
			Timestamp:     timestamp,
		})
		return
	}

	c.JSON(http.StatusOK, HttpResponse{
		ApplicationId: applicationId,
		Eligible:      true,
		Reason:        MsgReasonSuccess,
		Timestamp:     timestamp,
	})
}

func (h *Handler) validateRequest(req HttpRequest) error {

	missing := checkMissingFields(req)
	if len(missing) > 0 {
		return errors.New("missing required fields: " + strings.Join(missing, ", "))
	}

	if err := checkValueCondition(req); err != nil {
		return err
	}

	return nil
}

func checkMissingFields(req HttpRequest) []string {
	missing := []string{}

	if req.FullName == "" {
		missing = append(missing, "fullName")
	}

	if req.MonthlyIncome == 0 {
		missing = append(missing, "monthlyIncome")
	}

	if req.LoanAmount == 0 {
		missing = append(missing, "loanAmount")
	}

	if req.LoanPurpose == "" {
		missing = append(missing, "loanPurpose")
	}

	if req.Age == 0 {
		missing = append(missing, "age")
	}

	if req.PhoneNumber == "" {
		missing = append(missing, "phoneNumber")
	}

	if req.Email == "" {
		missing = append(missing, "email")
	}

	return missing
}

func checkValueCondition(req HttpRequest) error {

	if len(req.FullName) < 2 || len(req.FullName) > 255 {
		return errors.New("Full name must be between 2 and 255 characters")
	}
	if req.MonthlyIncome < 5000 || req.MonthlyIncome > 5000000 {
		return errors.New("Monthly income must be between 5,000 and 5,000,000")
	}
	if req.LoanAmount < 1000 || req.LoanAmount > 5000000 {
		return errors.New("Loan amount must be between 1,000 and 5,000,000")
	}
	if !isPurposeValid(req.LoanPurpose) {
		return errors.New("Loan purpose must be one of: home, car, education, wedding, other")
	}
	if req.Age < 0 {
		return errors.New("Age must be a number more than 0")
	}
	if !isNumericPhone(req.PhoneNumber) || len(req.PhoneNumber) != 10 {
		return errors.New("Phone number must be 10 digits and numeric")
	}
	if !isValidEmail(req.Email) {
		return errors.New("Email must be a valid email address")
	}
	return nil
}

func isNumericPhone(phone string) bool {
	for _, c := range phone {
		if c < '0' || c > '9' {
			return false
		}
	}
	return len(phone) > 0 // Optionally check for non-empty string
}

func isValidEmail(email string) bool {
	// Simple email regex pattern
	var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

func isPurposeValid(purpose string) bool {
	for _, v := range PurposeList {
		if purpose == v {
			return true
		}
	}
	return false
}
