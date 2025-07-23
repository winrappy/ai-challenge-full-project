package loaninquiry

import (
	"context"

	"github.com/stretchr/testify/mock"
)

type MockRepo struct {
	mock.Mock
}

// Helper function to create a new service with mocks
func NewMockRepo() *MockRepo {

	return &MockRepo{}
}

func (m *MockRepo) GetLoanApplicationWithAppId(ctx context.Context, applicationId string) (LoanApplicationEntity, error) {
	args := m.Called(ctx, applicationId)
	return args.Get(0).(LoanApplicationEntity), args.Error(1)
}

func (m *MockRepo) GetAllLoanApplication(ctx context.Context, purpose string, limit int, offset int) ([]LoanApplicationEntity, int, error) {
	args := m.Called(ctx, purpose, limit, offset)
	return args.Get(0).([]LoanApplicationEntity), args.Get(1).(int), args.Error(2)
}
