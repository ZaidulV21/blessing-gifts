# 🎁 Blessing Gifts — Premium E-Commerce Website

A complete, production-ready e-commerce website for Blessing Gifts built with **React + Tailwind CSS + Firebase**.

---

## 🚀 Quick Start (Run Locally)

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start

# App opens at http://localhost:3000
```

---

## 📁 Project Structure

```
blessing-gifts/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          ← Sticky navigation
│   │   ├── Footer.jsx          ← Footer
│   │   ├── ProductCard.jsx     ← Product grid card
│   │   └── ProductModal.jsx    ← Product detail popup
│   ├── context/
│   │   ├── CartContext.jsx     ← Cart state (global)
│   │   └── AdminContext.jsx    ← Admin login state
│   ├── data/
│   │   └── products.js         ← All products + WhatsApp number
│   ├── firebase/
│   │   ├── config.js           ← Firebase setup
│   │   └── services.js         ← Firestore/Storage functions
│   ├── pages/
│   │   ├── Home.jsx            ← Homepage
│   │   ├── Shop.jsx            ← Shop with filters
│   │   ├── Cart.jsx            ← Shopping cart
│   │   ├── Checkout.jsx        ← Checkout + WhatsApp order
│   │   ├── OrderSuccess.jsx    ← Success page
│   │   ├── TrackOrder.jsx      ← Order tracking
│   │   └── admin/
│   │       ├── AdminLogin.jsx      ← Admin login
│   │       ├── AdminLayout.jsx     ← Sidebar layout
│   │       ├── Dashboard.jsx       ← Stats overview
│   │       ├── AdminOrders.jsx     ← Order management
│   │       ├── AdminProducts.jsx   ← Product management
│   │       └── AdminCustomers.jsx  ← Customer list
│   ├── App.jsx                 ← Routes
│   ├── index.js                ← Entry point
│   └── index.css               ← Global styles
├── tailwind.config.js
├── firebase.json
└── package.json
```

---

## ⚙️ Configuration (Do This First!)

### 1. Set WhatsApp Number
Open `src/data/products.js` and change:
```js
export const WHATSAPP_NUMBER = "919876543210";
// Replace with client's number — country code + number, no spaces or +
// Example for +91 98765 43210: "919876543210"
```

### 2. Change Admin Password
Open `src/context/AdminContext.jsx`:
```js
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "blessing@2025"; // ← Change this!
```

### 3. Connect Firebase (for permanent storage)
Open `src/firebase/config.js` and paste your Firebase project config:
```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

**Firebase Setup Steps:**
1. Go to https://console.firebase.google.com
2. Create project → "blessing-gifts"
3. Add Web App → Register → Copy config
4. Enable **Firestore Database** (Start in test mode)
5. Enable **Storage** (Start in test mode)
6. Done ✅

---

## 🔌 Switching from localStorage to Firebase

Currently orders save to **browser localStorage** (works offline, good for testing).

To switch to **Firebase Firestore** (permanent cloud storage):

In `src/pages/Checkout.jsx`, replace the localStorage block with:
```js
import { addOrder } from "../firebase/services";

// Replace this:
const orders = JSON.parse(localStorage.getItem("bg_orders") || "[]");
orders.unshift(orderData);
localStorage.setItem("bg_orders", JSON.stringify(orders));

// With this:
await addOrder(orderData);
```

In `src/pages/admin/Dashboard.jsx` and `AdminOrders.jsx`, replace localStorage reads with:
```js
import { subscribeOrders } from "../../firebase/services";

useEffect(() => {
  const unsub = subscribeOrders(setOrders);
  return unsub; // cleanup on unmount
}, []);
```

---

## 🚢 Deploy to Firebase Hosting (Free)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (select Hosting, use 'build' as public dir)
firebase init

# Build & Deploy
npm run build
firebase deploy

# Your site will be live at: https://YOUR-PROJECT.web.app
```

---

## 📦 Delivery Integration (Shiprocket)

1. Create free account at https://app.shiprocket.in
2. When an order comes in (via WhatsApp), book a pickup on Shiprocket
3. Shiprocket gives you a tracking link
4. Paste the tracking link in **Admin → Orders → Tracking column**
5. Customer can see it instantly on the Track Order page

---

## 🔄 Returns Process

1. Customer WhatsApps to report issue
2. Client logs into Shiprocket → Create Reverse Pickup (~₹60–80)
3. Item comes back → client issues UPI refund manually
4. Policy: 7-day returns, unused items only

---

## 👤 Admin Panel

- **URL:** yoursite.com/admin
- **Default login:** admin / blessing@2025
- **Features:**
  - Dashboard with revenue stats
  - All orders with status management
  - Update order: Pending → Confirmed → Shipped → Delivered
  - Paste tracking link per order
  - Product management (full with Firebase)
  - Customer directory

---

## 💰 Cost Summary

| Item | Cost |
|------|------|
| Domain (blessinggifts.in) | ~₹800/year |
| Firebase (database + storage + hosting) | FREE |
| Shiprocket deliveries | ₹40–80 per shipment |
| **Total fixed cost** | **~₹800/year** |

---

## 🛠️ Tech Stack

- **React 18** — Frontend framework
- **React Router v6** — Page routing
- **Tailwind CSS** — Styling
- **Firebase** — Database, Storage, Hosting
- **Framer Motion** — Animations
- **react-hot-toast** — Toast notifications
- **lucide-react** — Icons
- **WhatsApp API** — Order notifications (free, no API key needed)

---

Built with ❤️ for Blessing Gifts, Lucknow
