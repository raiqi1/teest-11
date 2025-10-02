# Ajalabinn – Client & Backend

Project ini terdiri dari 2 bagian utama:
- **Client (Frontend)**: React + Vite
- **Backend (API)**: FastAPI + JWT Authentication

---

## 🚀 Cara Menjalankan Project

### 1. Clone Repository
```bash
git clone https://github.com/username/ajalabinn.git
cd ajalabinn
```

---

### 2. Menjalankan Backend (FastAPI)

#### a. Masuk ke folder backend
```bash
cd backend
```

#### b. Buat virtual environment (opsional, tapi disarankan)
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

#### c. Install dependencies
```bash
pip install -r requirements.txt
```

#### d. Jalankan server FastAPI
```bash
uvicorn main:app --reload
```

Backend akan jalan di:
```
http://127.0.0.1:8000
```

Cek dokumentasi API di:
- Swagger UI: http://127.0.0.1:8000/docs  
- Redoc: http://127.0.0.1:8000/redoc  

---

### 3. Menjalankan Client (React + Vite)

#### a. Masuk ke folder client
```bash
cd ../client
```

#### b. Install dependencies
```bash
npm install
```

#### c. Jalankan development server
```bash
npm run dev
```

Client akan jalan di:
```
http://localhost:5173
```

---

## 🛠️ Fitur Utama

### Backend
- Login dengan email & password (dummy)
- JWT Authentication
- CRUD Todo:
  - GET `/todos`
  - POST `/todos`
  - PUT `/todos/{id}`
  - DELETE `/todos/{id}`

### Client
- React + Vite
- Hot Module Replacement (HMR)
- Siap dikembangkan untuk consume API dari backend

---

## ⚠️ Catatan
- Token JWT hanya berlaku 30 menit
- Dummy akun login:
  - Email: `test@test.com`
  - Password: `123456`

---

## 📌 Tech Stack
- **Frontend**: React, Vite
- **Backend**: FastAPI, Uvicorn, PyJWT
- **Auth**: JWT Bearer Token
