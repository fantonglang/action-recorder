package main

import (
	"database/sql"
	"fmt"
	"os"

	"github.com/blockloop/scan"
	"github.com/joho/godotenv"
)

func GetDB() (*sql.DB, error) {
	err := godotenv.Load()
	if err != nil {
		return nil, err
	}
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	database := os.Getenv("DB_DATABASE")
	user_name := os.Getenv("DB_USERNAME")
	password := os.Getenv("DB_PASSWORD")

	db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", user_name, password, host, port, database))
	return db, err
}

func CloseDB(db *sql.DB) error {
	return db.Close()
}

func DbQuery(result interface{}, db *sql.DB, sql string, args ...interface{}) error {
	res, err := db.Query(sql, args...)
	if err != nil {
		return err
	}
	defer res.Close()
	err = scan.Rows(result, res)
	return err
}

func DbQueryRow(result interface{}, db *sql.DB, sql string, args ...interface{}) error {
	res, err := db.Query(sql, args...)
	if err != nil {
		return err
	}
	defer res.Close()
	err = scan.Row(result, res)
	return err
}

func DbExecute(db *sql.DB, sql string, args ...interface{}) error {
	_, err := db.Exec(sql, args...)
	if err != nil {
		return err
	}
	return nil
}
