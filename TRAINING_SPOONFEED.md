# EmergeX AI — LLM Spoon-feeding Guide
Use this document to "spoon-feed" any LLM (even basic ones) about your project. Copy and paste these sections sequentially or as needed.

---

## 1. The "System Prompt" (Step 1: Set the Stage)
*Paste this first to give the LLM its "Identity" and "Context".*

> "You are an expert full-stack developer and AI engineer acting as the lead maintainer for **EmergeX AI**. EmergeX AI is a safety-aware navigation platform that uses a Python-based Random Forest ML model to predict urban risk scores. The frontend is built in React 19, the backend in Node.js, and it is deployed as a multi-runtime serverless app on Vercel. Your goal is to help the owner maintain, debug, and expand this platform with 100% accuracy to the existing architecture."

---

## 2. Project "DNA" (Bite-Sized Context)
*Paste this to teach the LLM the core structure.*

| Component | Key Responsibility | Tech |
|---|---|---|
| **Frontend** | Interactive Map + Navigation UI | React, Leaflet, Axios |
| **Backend API** | Auth & Emergency SOS Logic | Node.js, Express, JWT, Twilio |
| **ML Engine** | Risk Prediction Inference | Python, Flask, Scikit-learn |
| **Data** | 10k sample crime dataset | CSV -> model.pkl |
| **Routing** | Mapping /api and /ml requests | vercel.json |

---

## 3. The "Spoon-feed" FAQ (Deep Knowledge)
*Paste these Q&As one by one if the LLM is struggling.*

**Q: How does the ML Risk prediction work?**
**A**: Features (Hour, Lighting, Crowd, Police Dist) are sent to `/ml/predict`. The Python service loads `api/model.pkl` and returns a 0-100 score. Accuracy is 95%.

**Q: How is the SOS alert sent?**
**A**: When the 5-sec countdown ends, the frontend calls `/api/emergency/alert`. The Node backend uses Twilio to send an SMS with the user's Live GPS and a Google Maps link.

**Q: Where is the user data stored?**
**A**: In `server/db.json`. Note: On Vercel, this file is ephemeral (read-only), so sign-ups don't persist across restarts.

**Q: What happens if the user leaves the route?**
**A**: `riskEngine.js` has a `distanceToRoute` function. If the user's GPS is >50m from the planned path, a "Route Deviation" warning appears.

**Q: How do I add a new feature?**
**A**: 
1. UI: Add to `src/pages/` or `src/components/`.
2. Context: Update `SafetyContext.jsx` or `AuthContext.jsx`.
3. Logic: Add specific functions to `src/services/`.

---

## 4. Operational Prompts
*Use these to get work done.*

- **"Write a new React component for the Navigation page that shows a 'Recent Incidents' list."**
- **"How do I update the ML model with fresh data from a new CSV file?"**
- **"Debug why the Twilio SMS isn't sending in the /api/emergency/alert route."**
- **"Style the EmergencyPanel to have a glassmorphism effect."**

---

## 5. File Cheat Sheet
- `api/ml.py`: The Brain (Python Inference).
- `api/index.js`: The Controller (Node.js API).
- `src/services/riskEngine.js`: The Math (Geospatial logic).
- `vercel.json`: The Map (Routing logic).
- `src/index.css`: The Look (Animations/Styles).
