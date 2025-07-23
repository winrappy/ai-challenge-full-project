package main

import (
	"backend-loan-pre-approval/configs"
	"backend-loan-pre-approval/pkg/database"
	"backend-loan-pre-approval/routes"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {

	appconf, err := configs.ReadConfig("configs")
	if err != nil {
		log.Fatalf("Error reading config file: %v", err)
	}

	db, err := database.ConnectPostgres(
		appconf.Database.Host,
		appconf.Database.Port,
		appconf.Database.User,
		appconf.Database.Password,
		appconf.Database.DBName)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})
	routes.SetupRoutes(r, db)
	r.Run(fmt.Sprintf(":%d", appconf.App.Port))
}
