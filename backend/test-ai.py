from ai_service import analyze_complaint
import json

# Test complaints in different languages
complaints = [
    "हमारे इलाके में पिछले 4 दिनों से पानी नहीं आ रहा है, बच्चे परेशान हैं। कल्याण पूर्व।",
    "Main MG Road has a deep open pothole right in front of the bus stop, very dangerous at night!",
    "कचऱ्याची गाडी गेल्या आठवड्यापासून आली नाही, खूप दुर्गंधी पसरली आहे स्टेशन रोडजवळ."
]

print("=== Running Citizen AI Pipeline Test ===\n")

for i, text in enumerate(complaints, start=1):
    print(f"[{i}] Citizen Input: {text}")
    result = analyze_complaint(text)
    print("AI Extracted Data:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    print("-" * 60)