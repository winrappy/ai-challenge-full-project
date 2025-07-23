package loaninquiry

import (
	"context"

	"github.com/stretchr/testify/mock"
)

type MockService struct {
	mock.Mock
}

func NewMockService() *MockService {
	return &MockService{}
}

func (m *MockService) GetLoanApplicationWithAppId(ctx context.Context, applicationId string) (ApplicationResponse, error) {
	args := m.Called(ctx, applicationId)
	return args.Get(0).(ApplicationResponse), args.Error(1)
}

func (m *MockService) GetAllLoanApplication(ctx context.Context, purpose string, limit int, offset int) ([]ApplicationResponse, int, error) {
	args := m.Called(ctx, purpose, limit, offset)
	return args.Get(0).([]ApplicationResponse), args.Get(1).(int), args.Error(2)
}
