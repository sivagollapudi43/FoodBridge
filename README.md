# FoodBridge – Smart Food Donation & Redistribution Platform

> A production-ready MERN stack foundation connecting surplus food donors (restaurants, caterers, supermarkets) with verified NGOs, shelters, and local volunteers to eliminate hunger and reduce food waste.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js (ES Modules), Express.js
- **Database**: MongoDB & Mongoose ODM
- **Authentication**: JWT & bcryptjs (ready for Auth modules)
- **Tooling**: Nodemon, PostCSS, Autoprefixer

---

## 📁 Scalable Project Structure

```text
FoodBridge/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection logic & event listeners
│   │   ├── controllers/            # Request handlers (business logic)
│   │   ├── middleware/
│   │   │   └── errorHandler.js     # Global 404 & centralized error handler
│   │   ├── models/                 # Mongoose schemas (User, Donation, Claim, etc.)
│   │   ├── routes/
│   │   │   └── health.routes.js    # API & Database health check endpoint
│   │   ├── utils/                  # Reusable utility functions
│   │   ├── app.js                  # Express app setup, CORS & middleware
│   │   └── server.js               # Entry point, environment loader & HTTP listener
│   ├── .env                        # Local environment variables
│   ├── .env.example                # Example environment template
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/                 # Static media and graphics
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx      # Responsive header with mobile menu
│   │   │   │   ├── Footer.jsx      # Platform links and standards
│   │   │   │   └── ApiStatusBadge.jsx # Real-time API & DB connection indicator
│   │   │   └── home/
│   │   │       ├── HeroSection.jsx     # Value proposition & primary CTAs
│   │   │       ├── ImpactMetrics.jsx   # Meals saved, partner counts, CO2 metric
│   │   │       ├── UserRolesSection.jsx# Donor, NGO, and Volunteer pillars
│   │   │       ├── HowItWorks.jsx      # 4-step smart redistribution flow
│   │   │       └── CtaSection.jsx      # Secondary call-to-action banner
│   │   ├── pages/
│   │   │   └── HomePage.jsx        # Landing page layout
│   │   ├── services/
│   │   │   └── api.js              # Fetch client & health check service
│   │   ├── App.jsx                 # Root application wrapper
│   │   ├── index.css               # Tailwind CSS directives
│   │   └── main.jsx                # React DOM entry point
│   ├── .env                        # Frontend environment variables
│   ├── .env.example
│   ├── index.html                  # HTML template with FoodBridge branding
│   ├── tailwind.config.js          # Custom brand color palette
│   ├── postcss.config.js
│   ├── vite.config.js              # Vite configuration with API proxy
│   └── package.json
│
├── .gitignore
├── package.json                    # Root convenience scripts
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/foodbridge
CLIENT_URL=http://localhost:5173
JWT_SECRET=supersecret_jwt_key_change_in_production_foodbridge_2026
JWT_EXPIRES_IN=7d
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 Running the Application

### 1. Start the Backend Server

```bash
cd backend
npm run dev
```

- Server will start at: `http://localhost:5000`
- API Health Status: `http://localhost:5000/api/health`

### 2. Start the Frontend Application

Open a second terminal:

```bash
cd frontend
npm run dev
```

- Frontend will start at: `http://localhost:5173`
- The live status badge in the navbar will automatically connect to `http://localhost:5000/api/health` and display **API Online** and **DB: Connected**.

---

## 🔍 Verification & Health Check

You can verify the backend API and database connection directly via curl or browser:

```bash
curl http://localhost:5000/api/health
```

Expected JSON Response:

```json
{
  "success": true,
  "platform": "FoodBridge API",
  "status": "Healthy",
  "timestamp": "...",
  "uptime": "...",
  "database": {
    "status": "Connected",
    "readyState": 1
  },
  "version": "1.0.0"
}
```

