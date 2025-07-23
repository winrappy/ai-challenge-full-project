package loaninquiry

import (
	"context"
	"errors"
	"strings"
)

type Service interface {
	GetLoanApplicationWithAppId(ctx context.Context, applicationId string) (ApplicationResponse, error)
	GetAllLoanApplication(ctx context.Context, purpose string, limit int, offset int) ([]ApplicationResponse, int, error)
}

type ServiceImpl struct {
	repository Repository
}

func NewService(repository Repository) Service {
	return &ServiceImpl{
		repository: repository,
	}
}

func (s *ServiceImpl) GetLoanApplicationWithAppId(ctx context.Context, applicationId string) (ApplicationResponse, error) {

	result, err := s.repository.GetLoanApplicationWithAppId(ctx, applicationId)
	if strings.Contains(err.Error(), ErrNoRows) {
		return ApplicationResponse{}, errors.New(ErrReasonApplicationNotFound + applicationId)
	}
	if err != nil {
		return ApplicationResponse{}, err
	}

	eligible, reason := checkEligibility(result)

	res := ApplicationResponse{
		ApplicationID: result.ApplicationId,
		FullName:      result.FullName,
		MonthlyIncome: result.MonthlyIncome,
		LoanAmount:    result.LoanAmount,
		LoanPurpose:   result.LoanPurpose,
		Age:           result.Age,
		PhoneNumber:   result.PhoneNumber,
		Email:         result.Email,
		Eligible:      eligible,
		Reason:        reason,
		Timestamp:     result.Timestamp,
	}

	return res, nil
}

func (s *ServiceImpl) GetAllLoanApplication(ctx context.Context, purpose string, limit int, offset int) ([]ApplicationResponse, int, error) {

	result, totalItems, err := s.repository.GetAllLoanApplication(ctx, purpose, limit, offset)
	if err != nil {
		return []ApplicationResponse{}, 0, err
	}

	res := []ApplicationResponse{}
	for _, v := range result {
		eligible, reason := checkEligibility(v)
		res = append(res, ApplicationResponse{
			ApplicationID: v.ApplicationId,
			FullName:      v.FullName,
			MonthlyIncome: v.MonthlyIncome,
			LoanAmount:    v.LoanAmount,
			LoanPurpose:   v.LoanPurpose,
			Age:           v.Age,
			PhoneNumber:   v.PhoneNumber,
			Email:         v.Email,
			Eligible:      eligible,
			Reason:        reason,
			Timestamp:     v.Timestamp,
		})
	}

	return res, totalItems, nil
}

func checkEligibility(req LoanApplicationEntity) (bool, string) {
	if req.MonthlyIncome < 10000 {
		return false, ErrMonthlyIncomeInsufficient
	}
	if req.Age < 20 || req.Age > 60 {
		return false, ErrAgeNotInRange
	}
	if req.LoanPurpose == "business" {
		return false, ErrBusinessLoansNotSupported
	}
	if req.LoanAmount > 12*req.MonthlyIncome {
		return false, ErrLoanAmountExceedsCap
	}
	return true, EligibleUnderBaseRules
}
