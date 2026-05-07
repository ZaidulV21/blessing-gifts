import Product from "../models/Product.js";
import { seedProducts } from "../data/seedProducts.js";

export async function seedDatabase() {
  const count = await Product.countDocuments();

  if (count > 0) {
    return;
  }

  await Product.insertMany(
    seedProducts.map((product) => ({
      ...product,
      imageUrl: product.image,
      images: product.images || [product.image].filter(Boolean),
    }))
  );
}