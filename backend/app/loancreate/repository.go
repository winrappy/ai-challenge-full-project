package loancreate

import (
	"context"
	"log"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	CreateLoanApplication(ctx context.Context, LoanApplication LoanApplicationEntity) error
}

type RepositoryImpl struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &RepositoryImpl{
		db: db,
	}
}

func (r *RepositoryImpl) CreateLoanApplication(ctx context.Context, LoanApplication LoanApplicationEntity) error {

	sql := `INSERT INTO loan_applications (
		application_id, full_name, monthly_income, loan_amount,
		loan_purpose, age, phone_number, email, timestamp
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	_, err := r.db.ExecContext(
		ctx, sql, LoanApplication.ApplicationId, LoanApplication.FullName,
		LoanApplication.MonthlyIncome, LoanApplication.LoanAmount,
		LoanApplication.LoanPurpose, LoanApplication.Age,
		LoanApplication.PhoneNumber, LoanApplication.Email,
		LoanApplication.Timestamp,
	)
	if err != nil {
		finalQuery := r.db.Rebind(sql)
		log.Println("sql: ", finalQuery)
		return err
	}

	return nil
}
