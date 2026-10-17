

**Jan-Aawaz (जन-आवाज़)** is an AI-powered municipal civic grievance classification and geospatial routing platform designed for Indian local governance. Built for speed, accessibility, and high uptime, the platform converts unstructured citizen complaints across local regional languages (Hindi, Marathi, English) into structured municipal action items with exact geospatial coordinates for command center dispatch.

---

##  Key Features

* **Multilingual Input & AI Translation:** Ingests grievances in regional languages and automatically translates them into clear English executive summaries.
* **Intelligent Auto-Triage:** Uses **Gemini 2.5 Flash** to extract grievance category (*Roads & Potholes, Water Supply, Garbage, Electricity*), urgency rating (*Critical, High, Medium, Low*), and citizen sentiment tone.
* **Geospatial Landmark Extraction:** Parses natural language descriptions (e.g., *"Sagaon Road near MIDC, Dombivli East"*) into precise latitude/longitude float coordinates.
* **Zero-Downtime Fallback Engine:** Features a `try-except` fallback handling mechanism in `ai_service.py` to prevent server crashes even during API rate limits or quota constraints.
* **Officer Command Center:** Real-time officer dashboard displaying live analytics cards, interactive Leaflet geospatial heatmaps, and persistent complaint data.

---

##  System Architecture

```text
+-----------------------+
|   Citizen Portal UI   |
|  (Firebase Hosting)   |
+-----------+-----------+
            |
    HTTP / REST API
            |
            v
+-----------------------+
| FastAPI Backend Engine|
|   (Cloud Run Service) |
+----+-------------+----+
     |             |
     |             |  Data Persistence
  v  |             v  (Native Mode)
+----+---------------+ +--------------------+
|  Gemini 2.5 Flash  | |  Google Cloud      |
|  Structured JSON   | |  Firestore DB      |
+--------------------+ +--------------------+
```

---

##  Tech Stack

* **Frontend:** React, Vite, Tailwind CSS, Leaflet Maps
* **Hosting:** Firebase Hosting
* **Backend:** FastAPI (Python), Uvicorn, `google-genai` SDK
* **Backend Deployment:** Google Cloud Run (`asia-south1`)
* **AI Model:** Gemini 2.5 Flash (`gemini-2.5-flash`)
* **Database:** Google Cloud Firestore (Native Mode)

---

##  License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
