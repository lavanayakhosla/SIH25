
# Sanjeevaniii - SIH 25026

This project provides a **terminology service** for AYUSH systems (Ayurveda, Siddha, Unani), based on the **NAMASTE Code System**. It allows searching, translating, and retrieving morbidity codes using **FHIR standards** and an **Elasticsearch backend**.

---

## 🌐 Live Demo

* **Frontend (React, Vercel):** https://namaste-icd11.vercel.app/
* **Backend (Node.js, Render):** https://namaste-backend-jpmi.onrender.com/health

---

## ✨ Features

* Retrieve definitions, synonyms, and mappings
* FHIR `$translate` API support
* CSV ingestion into Elasticsearch index
* User-friendly frontend for exploring terminology

---

## ⚙️ Running Locally

If you want to run the project locally instead of using the deployed demo:

### 1. Clone Repository

```bash
git clone https://github.com/lavanayakhosla/SIH25.git
cd SIH25
```

### 2. Start Backend

```bash
cd backend
npm install
```

Set environment variables (example for Bonsai Elasticsearch):

```bash
export ES_HOST="https://username:password@your-bonsai-cluster.bonsaisearch.net"
export ES_INDEX="namaste_terms"
```

Ingest sample data:

```bash
node ingest_namaste.js samples/namaste_sample.csv
```

Run the backend:

```bash
npm start
```

By default, the backend runs on **[http://localhost:3000](http://localhost:3000)**.

---

### 3. Start Frontend

```bash
cd frontend
npm install
npm start
```


---



## 📌 Notes

* Ensure Elasticsearch is running (locally or Bonsai cluster).
* If using Bonsai, never commit credentials — keep them in `.env` or Render/Vercel environment variables.

---
