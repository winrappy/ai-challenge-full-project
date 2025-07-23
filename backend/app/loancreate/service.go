package loancreate

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
)

type Service interface {
	CreateLoanApplication(ctx context.Context, req HttpRequest) (string, string, error)
}

type ServiceImopl struct {
	repository Repository
}

func NewService(repository Repository) Service {
	return &ServiceImopl{
		repository: repository,
	}
}

func (s *ServiceImopl) CreateLoanApplication(ctx context.Context, req HttpRequest) (string, string, error) {

	applicationId := uuid.New().String()
	timestamp := time.Now()
	timestampString := timestamp.Format(time.RFC3339)

	// Eligibility checks
	if req.MonthlyIncome < 10000 {
		return applicationId, timestampString, errors.New(ErrMonthlyIncomeInsufficient)
	}

	if req.Age < 20 || req.Age > 60 {
		return applicationId, timestampString, errors.New(ErrAgeNotInRange)
	}

	if req.LoanPurpose == "business" {
		return applicationId, timestampString, errors.New(ErrBusinessLoansNotSupported)
	}

	if req.LoanAmount > 12*req.MonthlyIncome {
		return applicationId, timestampString, errors.New(ErrLoanAmountExceedsCap)
	}

	LoanApplicationInsert := LoanApplicationEntity{
		ApplicationId: applicationId,
		FullName:      req.FullName,
		MonthlyIncome: req.MonthlyIncome,
		LoanAmount:    req.LoanAmount,
		LoanPurpose:   req.LoanPurpose,
		Age:           req.Age,
		PhoneNumber:   req.PhoneNumber,
		Email:         req.Email,
		Timestamp:     timestamp,
	}
	if err := s.repository.CreateLoanApplication(ctx, LoanApplicationInsert); err != nil {
		return applicationId, timestampString, err
	}

	return applicationId, timestampString, nil
}
