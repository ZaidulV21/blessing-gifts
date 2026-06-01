const API_BASE_URL = (process.env.REACT_APP_API_URL || "https://blessing-gifts-api.onrender.com").replace(/\/$/, "");

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new Error(payload?.message || "Request failed");
  }

  return payload;
}

const normalizeProduct = (product) => ({
  id: product.id || product._id,
  _id: product._id || product.id,
  name: product.name,
  price: product.price,
  mrp: product.mrp ?? product.price,
  description: product.description,
  imageUrl: product.imageUrl || product.image || "",
  image: product.image || product.imageUrl || "",
  images: Array.isArray(product.images)
    ? product.images.filter(Boolean)
    : typeof product.images === "string"
      ? product.images.split(/[,\n]/).map((image) => image.trim()).filter(Boolean)
      : [],
  related: Array.isArray(product.related)
    ? product.related
    : typeof product.related === "string"
      ? product.related.split(/[,\s]+/).map((r) => r.trim()).filter(Boolean)
      : [],
  category: product.category,
  stock: product.stock ?? (product.inStock ? 1 : 0),
  inStock: product.inStock ?? (product.stock > 0),
  badge: product.badge || "",
  features: Array.isArray(product.features) ? product.features : [],
  rating: product.rating ?? 4.5,
  reviews: product.reviews ?? 0,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

const normalizeOrder = (order) => ({
  id: order.orderId || order.id || order._id,
  _id: order._id || order.id,
  orderId: order.orderId || order.id || order._id,
  customerName: order.customerName || order.customer || "",
  customer: order.customer || order.customerName || "",
  phone: order.phone || "",
  email: order.email || "",
  address: order.address || "",
  items: Array.isArray(order.items) ? order.items : [],
  totalAmount: order.totalAmount ?? order.total ?? 0,
  total: order.total ?? order.totalAmount ?? 0,
  payment: order.payment || "COD",
  note: order.note || "",
  status: order.status || "Pending",
  trackingLink: order.trackingLink || "",
  date: order.date || (order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN") : "—"),
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

export async function getProducts() {
  const products = await request("/api/products");
  return products.map(normalizeProduct);
}

export async function getProductById(id) {
  const product = await request(`/api/products/${encodeURIComponent(id)}`);
  return normalizeProduct(product);
}

export async function createProduct(productData) {
  const product = await request("/api/products", {
    method: "POST",
    body: JSON.stringify(productData),
  });

  return normalizeProduct(product);
}

export async function updateProduct(id, productData) {
  const product = await request(`/api/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  });

  return normalizeProduct(product);
}

export async function deleteProduct(id) {
  return request(`/api/products/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function createOrder(orderData) {
  const order = await request("/api/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });

  return normalizeOrder(order);
}

export async function getOrderById(id) {
  const order = await request(`/api/orders/${encodeURIComponent(id)}`);
  return normalizeOrder(order);
}

export async function getOrderStatus(query) {
  try {
    return await getOrderById(query);
  } catch {
    return null;
  }
}

export async function getOrders() {
  const orders = await request("/api/orders");
  return orders.map(normalizeOrder);
}

export async function updateOrderStatus(id, status) {
  const order = await request(`/api/orders/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });

  return normalizeOrder(order);
}

export async function updateOrderTracking(id, trackingLink) {
  const order = await request(`/api/orders/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify({ trackingLink }),
  });

  return normalizeOrder(order);
}

/**
 * Create Razorpay Payment Order
 * Step 1 in payment flow: Initialize Razorpay order
 */
export async function createPaymentOrder(orderData) {
  const response = await request("/api/orders/payment/create", {
    method: "POST",
    body: JSON.stringify(orderData),
  });

  return {
    order: normalizeOrder(response.order),
    razorpay: response.razorpay,
  };
}

/**
 * Verify Razorpay Payment
 * Step 3 in payment flow: Verify signature and confirm payment
 */
export async function verifyRazorpayPayment(paymentData) {
  const response = await request("/api/orders/payment/verify", {
    method: "POST",
    body: JSON.stringify(paymentData),
  });

  return {
    order: normalizeOrder(response.order),
    paymentStatus: response.paymentStatus,
  };
}

/**
 * Handle Payment Failure
 * Called if payment fails
 */
export async function handlePaymentFailure(failureData) {
  return request("/api/orders/payment/failed", {
    method: "POST",
    body: JSON.stringify(failureData),
  });
}

/**
 * Validate Coupon Code
 * Validates coupon code and returns discount details
 */
export async function validateCoupon(code, orderAmount) {
  return request("/api/coupons/validate", {
    method: "POST",
    body: JSON.stringify({ code, orderAmount }),
  });
}

// Admin helpers
export async function getAnalytics() {
  return request("/api/settings/analytics");
}

export async function getSettings() {
  return request("/api/settings");
}

export async function getCoupons() {
  return request("/api/coupons");
}

export async function getReviews(status = "") {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return request(`/api/reviews${q}`);
}