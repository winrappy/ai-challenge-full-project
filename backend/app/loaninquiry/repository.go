package loaninquiry

import (
	"context"
	"errors"
	"log"
	"strings"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetLoanApplicationWithAppId(ctx context.Context, applicationId string) (LoanApplicationEntity, error)
	GetAllLoanApplication(ctx context.Context, purpose string, limit int, offset int) ([]LoanApplicationEntity, int, error)
}

type RepositoryImpl struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &RepositoryImpl{
		db: db,
	}
}

func (r *RepositoryImpl) GetLoanApplicationWithAppId(ctx context.Context, applicationId string) (LoanApplicationEntity, error) {

	sql := `SELECT * FROM loan_applications WHERE application_id = $1`

	var loanApplication LoanApplicationEntity
	if err := r.db.GetContext(ctx, &loanApplication, sql, applicationId); err != nil {
		if strings.Contains(err.Error(), ErrNoRows) {
			return LoanApplicationEntity{}, errors.New(ErrNoRows)
		}
		finalQuery := r.db.Rebind(sql)
		log.Println("sql: ", finalQuery)
		return LoanApplicationEntity{}, err
	}

	return loanApplication, nil
}

func (r *RepositoryImpl) GetAllLoanApplication(ctx context.Context, purpose string, limit int, offset int) ([]LoanApplicationEntity, int, error) {

	var loanApplications []LoanApplicationEntity
	args := []interface{}{purpose, limit, offset}

	sql := `SELECT *, COUNT(*) OVER() as total_count FROM loan_applications WHERE ($1 = '' OR loan_purpose = $1) LIMIT $2 OFFSET $3`
	if err := r.db.SelectContext(ctx, &loanApplications, sql, args...); err != nil {
		return nil, 0, err
	}

	total := 0
	if len(loanApplications) > 0 {
		total = loanApplications[0].TotalCount
	}

	return loanApplications, total, nil
}
