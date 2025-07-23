package configs

import (
	"fmt"
	"os"
	"strconv"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

func ReadConfig(pathConfigFile string) (AppConfig, error) {

	var appConfig AppConfig

	// Load .env file
	if err := godotenv.Load(pathConfigFile + "/.env"); err != nil {
		return appConfig, fmt.Errorf("no .env file found or error loading .env: %v", err)
	}

	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(pathConfigFile)
	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err != nil {
		return appConfig, fmt.Errorf("error reading config file: %v", err)
	}

	if err := viper.Unmarshal(&appConfig); err != nil {
		return appConfig, err
	}

	if os.Getenv("DB_HOST") != "" {
		appConfig.Database.Host = os.Getenv("DB_HOST")
	}

	if os.Getenv("DB_PORT") != "" {
		port, err := strconv.Atoi(os.Getenv("DB_PORT"))
		if err != nil {
			return appConfig, fmt.Errorf("error converting DB_PORT to int: %v", err)
		}
		appConfig.Database.Port = port
	}

	if os.Getenv("DB_USER") != "" {
		appConfig.Database.User = os.Getenv("DB_USER")
	}

	if os.Getenv("DB_PASS") != "" {
		appConfig.Database.Password = os.Getenv("DB_PASS")
	}

	if os.Getenv("DB_NAME") != "" {
		appConfig.Database.DBName = os.Getenv("DB_NAME")
	}

	return appConfig, nil
}
