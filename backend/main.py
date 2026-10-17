import json
import urllib.parse
import urllib.request
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.cloud import firestore

from ai_service import analyze_complaint

# Initialize FastAPI app
app = FastAPI(title="Jan-Aawaz AI API", version="1.0.0")

# Enable CORS so our React frontend can talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Firestore Client (auto-authenticates on Cloud Run)
db = firestore.Client()
COMPLAINTS_COLLECTION = "complaints"


# Request model for citizen submissions
class ComplaintSubmission(BaseModel):
    text: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None


def get_exact_coordinates(location_name: str):
    """
    Looks up the exact coordinates of Indian landmarks/villages
    directly on OpenStreetMap using free Nominatim geocoding.
    """
    if not location_name or location_name.lower() in ["null", "none", "n/a"]:
        return None, None

    try:
        query = f"{location_name}, Dombivli, Maharashtra, India"
        url = f"https://nominatim.openstreetmap.org/search?q={urllib.parse.quote(query)}&format=json&limit=1"
        
        req = urllib.request.Request(url, headers={"User-Agent": "JanAawazCivicApp/1.0"})
        with urllib.request.urlopen(req, timeout=4) as response:
            data = json.loads(response.read().decode())
            if data:
                lat = float(data[0]["lat"])
                lon = float(data[0]["lon"])
                print(f"[Geocoder] Exact match found for '{location_name}': {lat}, {lon}")
                return lat, lon
    except Exception as e:
        print(f"[Geocoder] Lookup error: {e}")

    return None, None


@app.get("/")
def health_check():
    return {"status": "online", "service": "Jan-Aawaz AI Civic Engine"}


@app.post("/api/complaints")
def submit_complaint(data: ComplaintSubmission):
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="Complaint text cannot be empty.")

    # 1. Run Gemini AI extraction
    ai_result = analyze_complaint(data.text)
    extracted_loc = ai_result.get("extracted_location")

    # 2. Determine Pinpoint Coordinates:
    if data.latitude and data.latitude != 0:
        final_lat, final_lon = data.latitude, data.longitude
    else:
        exact_lat, exact_lon = get_exact_coordinates(extracted_loc)
        if exact_lat and exact_lon:
            final_lat, final_lon = exact_lat, exact_lon
        else:
            final_lat = ai_result.get("latitude", 19.2184)
            final_lon = ai_result.get("longitude", 73.0867)

    # Prepare document for Firestore
    complaint_doc = {
        "raw_text": data.text,
        "original_language": ai_result.get("original_language", "Unknown"),
        "english_translation": ai_result.get("english_translation", ""),
        "category": ai_result.get("category", "Other"),
        "urgency": ai_result.get("urgency", "Medium"),
        "summary": ai_result.get("summary", ""),
        "extracted_location": extracted_loc or "Dombivli / Kalyan Ward",
        "latitude": final_lat,
        "longitude": final_lon,
        "timestamp": firestore.SERVER_TIMESTAMP,
    }

    # 3. Save to Firestore
    doc_ref = db.collection(COMPLAINTS_COLLECTION).document()
    complaint_doc["id"] = doc_ref.id
    doc_ref.set(complaint_doc)

    return {
        "success": True,
        "complaint_id": doc_ref.id,
        "analysis": ai_result,
        "location_used": {"latitude": final_lat, "longitude": final_lon}
    }


@app.get("/api/complaints")
def list_complaints():
    # Stream all documents from Firestore
    docs = db.collection(COMPLAINTS_COLLECTION).order_by("timestamp", direction=firestore.Query.DESCENDING).stream()
    complaints = []
    
    for doc in docs:
        item = doc.to_dict()
        item["id"] = doc.id
        # Convert timestamp to ISO string if present
        if "timestamp" in item and item["timestamp"]:
            item["timestamp"] = str(item["timestamp"])
        complaints.append(item)

    return complaints


@app.get("/api/dashboard/stats")
def dashboard_stats():
    docs = db.collection(COMPLAINTS_COLLECTION).stream()
    complaints = [doc.to_dict() for doc in docs]
    
    total = len(complaints)
    categories = {}
    urgency_counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}

    for c in complaints:
        cat = c.get("category") or "Other"
        categories[cat] = categories.get(cat, 0) + 1
        
        urg = c.get("urgency", "Medium")
        if urg in urgency_counts:
            urgency_counts[urg] += 1

    return {
        "total_complaints": total,
        "by_category": categories,
        "by_urgency": urgency_counts
    }