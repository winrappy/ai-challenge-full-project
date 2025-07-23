package routes

import (
	"backend-loan-pre-approval/app/loancreate"
	"backend-loan-pre-approval/app/loaninquiry"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
)

func SetupRoutes(r *gin.Engine, db *sqlx.DB) {

	loanCreateRepo := loancreate.NewRepository(db)
	loanCreatesrv := loancreate.NewService(loanCreateRepo)
	loanCreatehandler := loancreate.NewHandler(loanCreatesrv)

	loanInquiryRepo := loaninquiry.NewRepository(db)
	loanInquirySrv := loaninquiry.NewService(loanInquiryRepo)
	loanInquiryHandler := loaninquiry.NewHandler(loanInquirySrv)

	r.POST("/api/v1/loans", loanCreatehandler.LoansCreate)
	r.GET("/api/v1/loans/:applicationId", loanInquiryHandler.GetLoanApplicationWithAppId)
	r.GET("/api/v1/loans", loanInquiryHandler.GetAllLoanApplication)

}
