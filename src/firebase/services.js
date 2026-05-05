// src/firebase/services.js
// All Firebase Firestore + Storage operations in one place

import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot, serverTimestamp,
} from "firebase/firestore";
import { db } from "./config";

// Cloudinary upload function
const uploadToCloudinary = async (file) => {
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
  
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary not configured. Add REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET to .env");
  }
  
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Cloudinary upload failed");
  }
  
  const data = await res.json();
  return data.secure_url; // Permanent image URL
};

// ── GUARD: if Firebase not configured, operations are no-ops ──
const checkDB = () => {
  if (!db) throw new Error("Firebase not configured. Add .env variables.");
};

// ─────────────────────────────────────────────────────────────
//  ORDERS
// ─────────────────────────────────────────────────────────────

export const addOrder = async (orderData) => {
  checkDB();
  const docRef = await addDoc(collection(db, "orders"), {
    ...orderData,
    status:    "Pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getAllOrders = async () => {
  checkDB();
  const q    = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Real-time subscription — returns unsubscribe function
export const subscribeOrders = (callback) => {
  checkDB();
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const updateOrderStatus = async (orderId, status) => {
  checkDB();
  await updateDoc(doc(db, "orders", orderId), { status, updatedAt: serverTimestamp() });
};

export const updateOrderTracking = async (orderId, trackingLink) => {
  checkDB();
  await updateDoc(doc(db, "orders", orderId), { trackingLink, updatedAt: serverTimestamp() });
};

// ─────────────────────────────────────────────────────────────
//  PRODUCTS
// ─────────────────────────────────────────────────────────────

export const addProduct = async (productData, imageFile = null) => {
  checkDB();
  let imageUrl = productData.imageUrl || "";

  if (imageFile) {
    imageUrl = await uploadToCloudinary(imageFile);
  }

  const docRef = await addDoc(collection(db, "products"), {
    ...productData,
    imageUrl,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateProduct = async (productId, productData, imageFile = null) => {
  checkDB();
  let imageUrl = productData.imageUrl || "";

  if (imageFile) {
    imageUrl = await uploadToCloudinary(imageFile);
  }

  await updateDoc(doc(db, "products", productId), {
    ...productData,
    ...(imageUrl ? { imageUrl } : {}),
    updatedAt: serverTimestamp(),
  });
};

export const deleteProduct = async (productId) => {
  checkDB();
  await deleteDoc(doc(db, "products", productId));
};

export const getAllProducts = async () => {
  checkDB();
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

// Real-time subscription
export const subscribeProducts = (callback) => {
  checkDB();
  const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};
