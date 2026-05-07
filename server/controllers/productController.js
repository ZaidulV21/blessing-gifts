import Product from "../models/Product.js";

const normalizeFeatures = (features) => {
  if (Array.isArray(features)) {
    return features.filter(Boolean);
  }

  if (typeof features === "string") {
    return features
      .split(",")
      .map((feature) => feature.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeImages = (images, fallbackImage = "") => {
  const list = Array.isArray(images)
    ? images
    : typeof images === "string"
      ? images.split(/[,\n]/)
      : [];

  return [...list, fallbackImage]
    .map((image) => (typeof image === "string" ? image.trim() : ""))
    .filter(Boolean)
    .filter((image, index, array) => array.indexOf(image) === index);
};

const normalizeRelated = (related) => {
  if (Array.isArray(related)) return related.map(String).filter(Boolean);
  if (typeof related === "string") {
    return related
      .split(/[,\s]+/)
      .map((r) => r.trim())
      .filter(Boolean);
  }
  return [];
};

const toClientProduct = (product) => ({
  id: product._id.toString(),
  _id: product._id.toString(),
  name: product.name,
  price: product.price,
  mrp: product.mrp,
  description: product.description,
  image: product.image,
  imageUrl: product.imageUrl || product.image,
  images: normalizeImages(product.images, product.imageUrl || product.image),
  related: Array.isArray(product.related) ? product.related : [],
  category: product.category,
  stock: product.stock,
  inStock: product.inStock ?? product.stock > 0,
  badge: product.badge || "",
  features: product.features || [],
  rating: product.rating,
  reviews: product.reviews,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

export async function getProducts(req, res, next) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products.map(toClientProduct));
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(toClientProduct(product));
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    const payload = req.body;
    const image = payload.image || payload.imageUrl || "";
    const images = normalizeImages(payload.images, image);
    const related = normalizeRelated(payload.related);

    if (!payload.name || !payload.price || !payload.description || !payload.category) {
      return res.status(400).json({ message: "Name, price, description and category are required" });
    }

    const product = await Product.create({
      name: payload.name,
      price: Number(payload.price),
      mrp: Number(payload.mrp ?? payload.price),
      description: payload.description,
      image,
      imageUrl: image,
      images,
      category: payload.category,
      related,
      stock: Number(payload.stock ?? (payload.inStock === false ? 0 : 10)),
      badge: payload.badge || "",
      inStock: payload.inStock ?? true,
      features: normalizeFeatures(payload.features),
      rating: Number(payload.rating ?? 4.5),
      reviews: Number(payload.reviews ?? 0),
    });

    res.status(201).json(toClientProduct(product));
  } catch (error) {
    console.error("[createProduct error]", error.message || error);
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const payload = req.body;
    const image = payload.image || payload.imageUrl || "";
    const images = normalizeImages(payload.images, image);
    const related = normalizeRelated(payload.related);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: payload.name,
        price: payload.price !== undefined ? Number(payload.price) : undefined,
        mrp: payload.mrp !== undefined ? Number(payload.mrp) : undefined,
        description: payload.description,
        image: image || undefined,
        imageUrl: image || undefined,
        images: payload.images !== undefined || image ? images : undefined,
        related: payload.related !== undefined ? related : undefined,
        category: payload.category,
        stock: payload.stock !== undefined ? Number(payload.stock) : undefined,
        badge: payload.badge !== undefined ? payload.badge : undefined,
        inStock: payload.inStock,
        features: payload.features !== undefined ? normalizeFeatures(payload.features) : undefined,
        rating: payload.rating !== undefined ? Number(payload.rating) : undefined,
        reviews: payload.reviews !== undefined ? Number(payload.reviews) : undefined,
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(toClientProduct(product));
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (error) {
    next(error);
  }
}