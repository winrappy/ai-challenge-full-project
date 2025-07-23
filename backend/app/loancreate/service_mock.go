package loancreate

import (
	"context"

	"github.com/stretchr/testify/mock"
)

type MockService struct {
	mock.Mock
}

// Helper function to create a new service with mocks
func NewMockService() *MockService {

	return &MockService{}
}

func (m *MockService) CreateLoanApplication(ctx context.Context, req HttpRequest) (string, string, error) {
	args := m.Called(ctx, req)
	return args.String(0), args.String(1), args.Error(2)
}
