package loaninquiry

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) GetLoanApplicationWithAppId(c *gin.Context) {

	applicationId := c.Param("applicationId")

	loanApplication, err := h.service.GetLoanApplicationWithAppId(c.Request.Context(), applicationId)
	if err != nil {
		if strings.Contains(err.Error(), ErrReasonApplicationNotFound) {
			c.JSON(http.StatusBadRequest, ErrBadRequest{
				Message: ErrApplicationNotFound,
				Reason:  err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}
	c.JSON(http.StatusOK, loanApplication)
}

func (h *Handler) GetAllLoanApplication(c *gin.Context) {

	purpose := c.Query("purpose")
	limit := c.Query("limit")
	offset := c.Query("page")

	limitInt, err := strconv.Atoi(limit)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid parameter limit"})
		return
	}

	offsetInt, err := strconv.Atoi(offset)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid parameter page"})
		return
	}

	loanApplications, totalItems, err := h.service.GetAllLoanApplication(c.Request.Context(), purpose, limitInt, offsetInt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, http.StatusText(http.StatusInternalServerError))
		return
	}

	totalPages := totalItems / limitInt
	res := GetAllLoanApplicationResponse{
		Applications: loanApplications,
		Page:         offsetInt,
		TotalPages:   totalPages,
	}

	c.JSON(http.StatusOK, res)
}
