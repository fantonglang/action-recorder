package main

import (
	"database/sql"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
)

var db *sql.DB

type ReportData struct {
	Type    string
	Data    string
	Time    int64
	Session int64
}

func report(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")
	if r.Method != "POST" {
		w.WriteHeader(400)
		return
	}
	bytes, err := ioutil.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(400)
		w.Write([]byte(err.Error()))
		return
	}
	var data ReportData
	err = json.Unmarshal(bytes, &data)
	if err != nil {
		w.WriteHeader(400)
		w.Write([]byte(err.Error()))
		return
	}
	DbExecute(db, "insert into events(`type`,`data`,`time`,`session`) values (?,?,?,?)", data.Type, data.Data, data.Time, data.Session)
	w.Write([]byte("OK"))
}

func info(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")
	if r.Method != "GET" {
		w.WriteHeader(400)
		return
	}
	log.Println("INFO")
	w.Write([]byte("OK"))
}

func main() {
	_db, err := GetDB()
	if err != nil {
		log.Fatalln(err)
	}
	db = _db
	mux := http.NewServeMux()
	mux.HandleFunc("/report", report)
	mux.HandleFunc("/info", info)
	if err = http.ListenAndServe(":5001", mux); err != nil {
		log.Println(err)
		err = db.Close()
		if err != nil {
			log.Println(err)
		}
	}
}
