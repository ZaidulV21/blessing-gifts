# 🔥 Firebase Setup Guide — Blessing Gifts

## Why Firebase?
Right now products are stored in a static file (`src/data/products.js`).
Once you connect Firebase, you can:
- ✅ Add / Edit / Delete products from the Admin Panel
- ✅ Upload product images directly
- ✅ Orders save permanently to the cloud
- ✅ All data syncs in real-time across devices

---

## Step 1 — Create .env file

In your project folder (same level as `package.json`), create a file called `.env`

**The file name is exactly:  `.env`  (starts with a dot, no other extension)**

Paste this inside:

```
REACT_APP_FIREBASE_API_KEY=your_value_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_value_here
REACT_APP_FIREBASE_PROJECT_ID=your_value_here
REACT_APP_FIREBASE_STORAGE_BUCKET=your_value_here
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_value_here
REACT_APP_FIREBASE_APP_ID=your_value_here
REACT_APP_WHATSAPP_NUMBER=919876543210
```

---

## Step 2 — Get your Firebase values

1. Go to https://console.firebase.google.com
2. Open your project
3. Click the **⚙️ gear icon** (top left, next to "Project Overview")
4. Click **Project settings**
5. Scroll down to **"Your apps"**
6. Click your web app (the `</>` icon)
7. You will see a `firebaseConfig` block like this:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",           ← copy to REACT_APP_FIREBASE_API_KEY
  authDomain: "your-app...",     ← copy to REACT_APP_FIREBASE_AUTH_DOMAIN
  projectId: "your-app",         ← copy to REACT_APP_FIREBASE_PROJECT_ID
  storageBucket: "your-app...",  ← copy to REACT_APP_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123...",   ← copy to REACT_APP_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc..."      ← copy to REACT_APP_FIREBASE_APP_ID
};
```

---

## Step 3 — Enable Firestore and Storage

In Firebase Console → left menu → **Build**:

1. Click **Firestore Database** → Create database → Start in test mode → Enable
2. Click **Storage** → Get started → Start in test mode → Done

---

## Step 4 — Restart the app

In VS Code terminal:
```
Ctrl + C   (stop the running app)
npm start  (start again — it will now read your .env file)
```

---

## Step 5 — Add your first product

1. Go to `yoursite.com/admin` → log in
2. Click **Products** in sidebar
3. Click **+ Add Product**
4. Fill in details, upload image → Save

The product will instantly appear on your store! 🎉

---

## Firestore Security Rules

Before going live (after testing), update rules in Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /orders/{id} {
      allow create: if true;               // customers can place orders
      allow read, update: if request.auth != null;  // only admin can view/update
    }
    match /products/{id} {
      allow read: if true;                 // anyone can view products
      allow write: if request.auth != null; // only admin can change products
    }
  }
}
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Products still showing old static data | Check .env file exists and has correct values. Restart npm start. |
| "Firebase not configured" error | Make sure .env file is in root folder (same level as package.json) |
| Image upload fails | Enable Storage in Firebase Console. Check storage rules allow write. |
| Orders not appearing in admin | Check Firestore is enabled. Check browser console for error messages. |

