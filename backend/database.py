import sqlite3
from datetime import datetime

DB_FILE = "complaints.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            raw_text TEXT NOT NULL,
            original_language TEXT,
            english_translation TEXT,
            category TEXT,
            urgency TEXT,
            sentiment TEXT,
            extracted_location TEXT,
            summary TEXT,
            latitude REAL,
            longitude REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def save_complaint(complaint_data: dict, raw_text: str, lat: float = None, lon: float = None):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO complaints (
            raw_text, original_language, english_translation,
            category, urgency, sentiment, extracted_location,
            summary, latitude, longitude
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        raw_text,
        complaint_data.get("original_language"),
        complaint_data.get("english_translation"),
        complaint_data.get("category"),
        complaint_data.get("urgency"),
        complaint_data.get("sentiment"),
        complaint_data.get("extracted_location"),
        complaint_data.get("summary"),
        lat,
        lon
    ))
    complaint_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return complaint_id

def get_all_complaints():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints ORDER BY created_at DESC")
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return rows