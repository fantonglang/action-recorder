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
	Session string
	KeyElId *int `json:"key_el_id"`
}

type InfoData struct {
	Id      int    `db:"id" json:"id"`
	PageUrl string `db:"page_url" json:"pageUrl"`
	XPath   string `db:"xpath" json:"xpath"`
	Type    string `db:"type" json:"type"`
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
	DbExecute(db, "insert into events(`type`,`data`,`time`,`session`,`key_el_id`) values (?,?,?,?,?)", data.Type, data.Data, data.Time, data.Session, data.KeyElId)
	w.Write([]byte("OK"))
}

func info(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Access-Control-Allow-Origin", "*")
	if r.Method != "GET" {
		w.WriteHeader(400)
		return
	}
	var infos []InfoData
	err := DbQuery(&infos, db, "select * from key_elements order by id")
	if err != nil {
		w.WriteHeader(400)
		w.Write([]byte(err.Error()))
		return
	}
	if bytes, err := json.Marshal(infos); err != nil {
		w.WriteHeader(400)
		w.Write([]byte(err.Error()))
	} else {
		w.Write(bytes)
	}

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
