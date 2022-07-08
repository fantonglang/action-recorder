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

type EventData struct {
	Id   int64  `db:"id"`
	Type string `db:"type"`
	Data string `db:"data"`
	Time int64  `db:"time"`
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

func finishSession(w http.ResponseWriter, r *http.Request) {
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
	var input map[string]string
	err = json.Unmarshal(bytes, &input)
	if err != nil {
		w.WriteHeader(400)
		w.Write([]byte(err.Error()))
		return
	}
	sessionId := input["session_id"]
	current := 0
	var lastRec interface{} = nil
	inited := false
	for {
		var events []EventData
		err = DbQuery(&events, db, "select * from events where session = ? order by id limit 100 offset ?", sessionId, current)
		if err != nil {
			w.WriteHeader(400)
			w.Write([]byte(err.Error()))
			return
		}
		if len(events) == 0 {
			break
		}
		for _, e := range events {
			if !inited {
				// before the first init, there are probably mouse move events, to be skiped
				if e.Type != "INIT" {
					continue
				} else {
					inited = true
					lastRec = e
					continue
				}
			}
			if e.Type == "INIT" && lastRec.(EventData).Type != "INIT" {
				err = DbExecute(db, "update events set page_last=1 where id=?", lastRec.(EventData).Id)
				if err != nil {
					w.WriteHeader(400)
					w.Write([]byte(err.Error()))
					return
				}
			}
			if e.Type == "MOUSE_TRACK" || e.Type == "SCROLL" {
				duration := e.Time - lastRec.(EventData).Time
				err = DbExecute(db, "update events set duration=? where id=?", duration, e.Id)
				if err != nil {
					w.WriteHeader(400)
					w.Write([]byte(err.Error()))
					return
				}
			}
			lastRec = e
		}
		current += 100
	}

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
	mux.HandleFunc("/finish_session", finishSession)
	if err = http.ListenAndServe(":5001", mux); err != nil {
		log.Println(err)
		err = db.Close()
		if err != nil {
			log.Println(err)
		}
	}
}
