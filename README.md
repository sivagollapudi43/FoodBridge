# FoodBridge – Smart Food Donation & Redistribution Platform

> A production-grade, full-stack MERN platform connecting surplus food donors (restaurants, hotels, supermarkets, caterers) with verified NGOs, shelters, and volunteer couriers to eliminate food waste and fight hunger.

[![Tech Stack](https://img.shields.io/badge/Stack-MERN%20(React%20%2B%20Node%20%2B%20Express%20%2B%20Mongo)-10b981)](https://github.com/sivagollapudi43/FoodBridge)
[![Real-Time](https://img.shields.io/badge/Real--Time-Socket.IO-blue)](https://socket.io/)
[![Security](https://img.shields.io/badge/Security-JWT%20%2B%20bcrypt%20%2B%20RBAC%20%2B%20Helmet-emerald)](https://github.com/sivagollapudi43/FoodBridge)

---

## 🌟 Key Features by User Role

### 🥘 1. Donor Portal (Restaurants, Caterers, Supermarkets)
- **Fast Food Listing**: Post surplus food with quantity, packaging condition, storage condition (Room Temp, Refrigerated, Hot Holding), allergens, and pickup window.
- **Automated Estimated Meals**: Automatically computes meals saved based on portion and weight algorithms.
- **Smart NGO Recommendations**: Rule-based scoring engine ranks the closest, verified, and highest-capacity NGOs.
- **Claim Request Management**: Accept or decline incoming NGO claims. Accepting claims automatically generates a dual-point pickup handshake code.
- **Live Statistics**: Real-time tracking of active listings, meals saved, and waste diverted.

### 🤝 2. NGO Organization Portal (Shelters & Charities)
- **Surplus Food Marketplace**: Search by food title, filter by category (Prepared Meals, Bakery, Fruits/Vegetables, etc.), and sort by urgent collection deadlines.
- **One-Click Claim Submission**: Specify beneficiary counts and distribution purpose.
- **Volunteer Courier Dispatch**: Assign active volunteers with vehicle profiles (bicycle, motorcycle, car, van) to pick up food.
- **Verification Governance**: Verification state management to guarantee hygiene standards.

### 🛵 3. Volunteer Courier Portal
- **Mission Control**: View assigned pickups with donor contact, street address, and one-click Google Maps routing.
- **Dual-Point Handshake Verification**:
  1. *Pickup Handshake*: Input donor's 6-digit confirmation code / QR to mark food as `Collected`.
  2. *Delivery Handshake*: Input shelter's 6-digit confirmation code to mark food as `Delivered`.
- **Availability Toggle**: Set status to Active or Off-Duty.

### 🛡️ 4. Administrator Command Center
- **System Telemetry & KPIs**: Real-time metrics for total users, active listings, meals redistributed, and CO₂ mitigated.
- **Visual Analytics**: Interactive Recharts graphs showing 7-day donation flow and food category distributions.
- **NGO Partner Verification**: Review NGO registration certificates and approve/reject with 1 click.
- **User Governance**: Suspend or reactivate user accounts.
- **Immutable Audit Trail**: Chronological event logs for all critical system mutations.

---

## ⚡ Quick Start: Demo Login Accounts

All accounts are pre-seeded with realistic data:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@foodbridge.org` | `password123` | Full administrative command access |
| **Donor** | `donor@greenplate.com` | `password123` | Green Plate Bistro (Verified Restaurant) |
| **NGO (Verified)** | `ngo@hopefeed.org` | `password123` | Hope Feed Foundation (Active NGO) |
| **NGO (Pending)** | `ngo@citycare.org` | `password123` | City Care Shelter (Under admin review) |
| **Volunteer** | `volunteer@speedy.com` | `password123` | Kiran Kumar (Active Motorcycle Courier) |

*(Quick 1-click buttons are also available directly on the `/login` page for fast testing!)*

---

## 🏃 Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas URI)

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed       # Seeds realistic sample data and users
npm run dev        # Starts backend API on http://localhost:5000
```

### 2. Frontend Setup
In a second terminal:
```bash
cd frontend
npm install
npm run dev        # Starts React frontend on http://localhost:5173
```

---

## 🧪 Automated End-to-End Testing

Run the full 16-step integration workflow test:
```bash
cd backend
npm test
```

Verifies:
- Health check
- Role-based authorization & security barriers
- Listing creation & safety validation
- Rule-based NGO smart matching calculation
- Atomic donation claim reservation (prevents double claims)
- Volunteer courier assignment
- Handshake verification codes for collection & delivery
- Socket.IO real-time notification dispatch

---

## 📁 Architecture Overview

```text
FoodBridge/
├── backend/
│   ├── src/
│   │   ├── config/             # DB & MongoDB lifecycle listeners
│   │   ├── controllers/        # Auth, Donation, Request, Delivery, Admin, Notification
│   │   ├── middleware/         # JWT protect, RBAC authorize, Error handling
│   │   ├── models/             # All 10 Mongoose schemas (User, Org, Donation, Delivery, etc.)
│   │   ├── routes/             # RESTful API routes
│   │   ├── services/           # Smart NGO matching algorithm
│   │   ├── sockets/            # Socket.IO real-time notification engine
│   │   ├── tests/              # End-to-end integration test runner
│   │   └── utils/              # Database seeder, audit logger, token generator
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Common UI & Home sections
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── layouts/            # PublicLayout & DashboardLayout (Sidebar, Top Nav)
│   │   ├── pages/              # Public (Marketplace, About, Contact) & Dashboards (Donor, NGO, Volunteer, Admin)
│   │   └── services/           # Axios instance with JWT interceptor
```
