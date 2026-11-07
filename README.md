# FoodBridge – Simple Food Donation & Sharing Platform

> A clean, straightforward full-stack MERN platform connecting people and businesses with surplus food directly to individuals and shelters in need.

[![Tech Stack](https://img.shields.io/badge/Stack-MERN%20(React%20%2B%20Node%20%2B%20Express%20%2B%20Mongo)-10b981)](https://github.com/sivagollapudi43/FoodBridge)

---

## 💡 Simplified User Roles

The system is streamlined into two clean roles:

### 1. 👤 Regular User
- **Register & Sign In**: Fast registration with Name, Email, Password, Phone, and City.
- **Add Available Food**: Simple form to post food name, category (Cooked Food, Groceries, Bakery, Fruits/Vegetables), quantity, pickup address, phone number, and collection time.
- **Browse Available Food**: Search and filter live food listings with phone numbers for easy pickup coordination.
- **Claim Food**: Instantly mark food as claimed.
- **My Food Listings**: View and delete food items you have added.

### 2. 🛡️ Administrator (`sivagollapudi43@gmail.com`)
- **Admin Dashboard**: View total food listings, available vs claimed items, and registered users.
- **Manage Food Listings**: Review all posted food across the platform and delete inappropriate listings with 1 click.
- **Manage Users**: View registered members and remove accounts if necessary.

---

## ⚡ Quick Demo Accounts

| Role | Email | Password | What You Can Do |
| :--- | :--- | :--- | :--- |
| **Admin** | **`sivagollapudi43@gmail.com`** | `password123` | View statistics, manage all food listings, manage users |
| **User** | **`user@foodbridge.com`** | `password123` | Post new food, view available food, claim food |

*(1-click test buttons are available on the **[Login Page](http://localhost:5173/login)**!)*

---

## 🏃 Running Locally

### Backend
```bash
cd backend
npm run dev        # Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm run dev        # Runs on http://localhost:5173
```

---

## 📁 Clean Project Structure

```text
FoodBridge/
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection
│   │   ├── models/
│   │   │   ├── User.js           # User schema (roles: 'user', 'admin')
│   │   │   └── Donation.js       # Food listing schema (title, quantity, address, phone, status)
│   │   ├── controllers/
│   │   │   ├── authController.js # Simple register & login
│   │   │   ├── donationController.js # Add food, get food, claim food, delete food
│   │   │   └── adminController.js    # Overview stats, manage listings & users
│   │   ├── routes/               # Clean REST routes (/api/auth, /api/donations, /api/admin)
│   │   ├── middleware/auth.js    # JWT verification & adminOnly guard
│   │   ├── app.js
│   │   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── HomePage.jsx      # Clean landing page
│   │   │   ├── food/
│   │   │   │   ├── AddFoodPage.jsx   # Simple form to add available food
│   │   │   │   ├── FoodFeedPage.jsx  # Browse available food & claim
│   │   │   │   └── MyFoodPage.jsx    # Manage food I posted
│   │   │   ├── admin/
│   │   │   │   └── AdminPage.jsx     # Admin control dashboard
│   │   │   └── auth/
│   │   │       ├── LoginPage.jsx     # Login with 1-click test buttons
│   │   │       └── RegisterPage.jsx  # Simple user registration
│   │   ├── components/common/Navbar.jsx
│   │   ├── context/AuthContext.jsx
│   │   └── services/api.js
```
