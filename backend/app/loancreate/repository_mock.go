package loancreate

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

func (m *MockRepo) CreateLoanApplication(ctx context.Context, LoanApplication LoanApplicationEntity) error {
	args := m.Called(ctx, LoanApplication)
	return args.Error(0)
}
