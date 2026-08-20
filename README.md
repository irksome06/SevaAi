# SevaAI — Multilingual AI-Powered Citizen Platform

> A comprehensive digital public service platform empowering citizens across India with AI-driven civic problem reporting, grievance letters, RTI assistance, government schemes discovery, application tracking, and encrypted document vault.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Lucide Icons, Custom Accessible Design System
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB
- **Security & Authentication**:
  - `bcryptjs` password hashing (salt rounds = 12)
  - JSON Web Tokens (`jsonwebtoken`)
  - Real SMS OTP delivery through Twilio, MSG91, 2Factor, or Fast2SMS
  - Protected API and Frontend routes

---

## 📁 Project Structure

```
SevaAi-1/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection logic
│   │   ├── controllers/
│   │   │   └── authController.js     # Register, Login, OTP, Profile handlers
│   │   ├── middleware/
│   │   │   └── authMiddleware.js     # Bearer JWT route guard
│   │   ├── models/
│   │   │   ├── User.js               # Citizen user schema
│   │   │   └── Otp.js                # OTP verification schema with TTL index
│   │   ├── routes/
│   │   │   └── authRoutes.js         # REST endpoints for authentication
│   │   ├── services/
│   │   │   └── otpService.js         # Modular SMS/OTP provider architecture
│   │   ├── utils/
│   │   │   └── tokenUtils.js         # JWT signing & decoding utilities
│   │   ├── app.js                    # Express app configuration & middlewares
│   │   └── server.js                 # Server bootstrap & process lifecycle
│   ├── .env.example                  # Environment configuration template
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthNavbar.jsx        # Civic branding navigation bar
│   │   │   ├── LanguageSelector.jsx  # Multilingual language switcher (13 languages)
│   │   │   ├── OtpInput.jsx          # 6-box individual OTP component
│   │   │   ├── ProtectedRoute.jsx    # Client-side route authentication guard
│   │   │   └── ServiceCard.jsx       # Dashboard service placeholder card
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global citizen authentication state
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx         # Email + Password login page
│   │   │   ├── RegisterPage.jsx      # Citizen registration form
│   │   │   ├── PhoneLoginPage.jsx    # Indian phone (+91) OTP verification page
│   │   │   └── DashboardPage.jsx     # Protected citizen dashboard
│   │   ├── services/
│   │   │   └── api.js                # Centralized Fetch API client
│   │   ├── styles/
│   │   │   ├── index.css             # Base design tokens & CSS reset
│   │   │   ├── auth.css              # Authentication views styling
│   │   │   └── dashboard.css         # Dashboard layout styling
│   │   ├── App.jsx                   # React Router routing configuration
│   │   └── main.jsx                  # React DOM root entrypoint
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ or v20+
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI.

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Copy .env.example to .env and adjust if needed
cp .env.example .env

# Start backend server in development mode
npm run dev
```

Backend will run on **`http://localhost:5000`**.

---

### 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Frontend will run on **`http://localhost:5173`**.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Express server port | `5000` |
| `NODE_ENV` | Environment mode (`development` / `production`) | `development` |
| `MONGODB_URI` | MongoDB connection URI | `mongodb://127.0.0.1:27017/sevaai` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `sevaai_super_secret_jwt_key_2025...` |
| `JWT_EXPIRES_IN` | Token validity duration | `7d` |
| `SMS_PROVIDER` | Active SMS provider (`twilio`, `msg91`, `twofactor`, `fast2sms`) | Required |
---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Backend health & uptime check |
| `POST` | `/api/auth/register` | Public | Register new citizen with email, password & language |
| `POST` | `/api/auth/login` | Public | Authenticate citizen with email + password |
| `POST` | `/api/auth/send-otp` | Public | Request 6-digit OTP for Indian phone (`+91`) |
| `POST` | `/api/auth/verify-otp` | Public | Verify OTP and authenticate/create citizen |
| `GET` | `/api/auth/me` | Protected | Fetch authenticated citizen profile via Bearer token |

---

## 📱 Phone OTP Architecture

1. Configure one SMS gateway in `backend/.env` (Twilio is shown in `.env.example`).
2. The server sends a cryptographically random six-digit code to the supplied mobile number.
3. Only a SHA-256 hash of the code is saved; the raw OTP is never exposed by the API or stored in MongoDB.
4. Codes expire after five minutes, are single-use, and are invalidated after five failed attempts.
