# EmergeX AI — Project Knowledge Base (A-Z)
This document serves as the ground truth for training an LLM on the EmergeX AI project.

## 1. Project Overview
**EmergeX AI** is a privacy-first, safety-aware urban navigation platform. It enables travelers to make informed decisions by visualizing geospatial risk scores and comparing routes based on both safety and efficiency.

### Core Philosophy
- **Privacy First**: No persistent location tracking. Use of grid-cell aggregation instead of precise incident markers.
- **Data-Driven**: Real-time risk scoring powered by Machine Learning.
- **Empowerment**: Providing structured safety intelligence to the user without dictating their path.

---

## 2. Technical Stack
- **Frontend**: React 19, Vite, Leaflet (Map rendering), Vanilla CSS (animations).
- **Backend (Node.js)**: Express.js, JWT Authentication, bcrypt password hashing.
- **Backend (Python)**: Flask API, Scikit-learn (Random Forest Regressor).
- **Deployment**: Vercel (Multi-runtime Serverless: Node.js + Python).
- **Integration**: Twilio (Real SMS Alerts), OpenStreetMap Nominatim (Location search).

---

## 3. Comprehensive Feature List
### A. Risk Map Visualization
- Uses a grid system to divide cities into cells.
- Each cell is color-coded by "Risk Score" (0-100).
- Supports Heatmap overlays for density visualization.

### B. Safety-Aware Navigation
- Origin/Destination search via OpenStreetMap.
- Real-time route calculation with quantified safety badges (e.g., "12% Safer").
- **Unified Experience**: The Transition from route planning to live GPS simulation happens on the same page for zero latency.

### C. Predictive ML Engine
- Random Forest model trained on 10,000 synthetic samples.
- Features: `Block_ID`, `Hour`, `Lighting_Score`, `Police_Distance`, `Past_Incidents`, `Crowd_Density`.
- **Accuracy**: 95% R2 Score.

### D. Consent-Based SOS
- 5-second countdown to prevent accidental triggers.
- Automatically generates a pre-filled SMS with:
  - Precise GPS coordinates.
  - A secure, clickable Google Maps link.
- **Backend Integration**: Dispatches real SMS to a list of emergency contacts via Twilio.

### E. Security & Privacy
- **PWA Support**: Offline tile caching and installable interface.
- **Rate Limiting**: Built-in 100 req/min sliding window protection.
- **Fairness Monitoring**: Real-time audit of FPR/FNR disparity across time groups (Pass/Fail threshold: 5%).

---

## 4. System Logic & Data Flow
1. **User Input**: Geocodes address via Nominatim.
2. **Analysis**: Route coordinates are sent to the `RiskEngine` (simulated) and the `ML Service` (Python API).
3. **Inference**: The Python service loads `model.pkl` and returns a real-time risk score.
4. **Comparison**: Frontend renders route cards with safety and ETA deltas.
5. **Navigation**: User starts live navigation; position is tracked, and "Deviation Detection" alerts if the user leaves the safe path.
6. **Emergency**: If SOS is triggered, the Backend fetches user contacts and sends SMS via Twilio using a JWT token for identity verification.

---

## 5. Directory Structure
- `/api`: Vercel serverless entry points (Node.js & Python).
- `/server`: Core Express application logic (Auth, Routes, DB helpers).
- `/src/services`: Quantified logic for Risk Scoring and Emergency delivery.
- `/src/pages`: User interfaces (Map, Navigation, Profile, Auth).

---

## 6. Deployment Notes
- Production URL: `https://emergex-ai.vercel.app`
- Environment Variables required: `JWT_SECRET`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`.

---

## 7. How to Train/Integrate an LLM
To make a basic LLM completely understand this project, use the following methods:

### Method A: Retrieval-Augmented Generation (RAG)
1. **Index the files**: Feed the contents of `README.md`, `KNOWLEDGE_BASE.md`, and `API` directory into a vector database (e.g., Pinecone, Supabase).
2. **Context Injection**: When asking the LLM about the project, provide the relevant chunks from these documents as context.

### Method B: Fine-Tuning
1. **Dataset Creation**: Convert this `KNOWLEDGE_BASE.md` into a set of Question-Answer pairs.
   - *Example Q*: "How does EmergeX handle emergency alerts?"
   - *Example A*: "It uses a 5-second countdown... [details from Section 3D]."
2. **Fine-tuning**: Use these pairs to fine-tune a model like GPT-4o-mini or Llama-3.

### Method C: Long Context Window (Easiest)
Simply upload the `KNOWLEDGE_BASE.md` and the `api/` directory directly to a model with a large context window (like Gemini 1.5 Pro) and ask: *"Learn this project architecture and logic."*
