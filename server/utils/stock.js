import Product from "../models/Product.js";

export function resolveProductStatus(product = {}) {
  if (product.status === "out_of_stock") {
    return "out_of_stock";
  }

  const stock = Number(product.stock ?? 0);

  if (product.status === "in_stock") {
    return stock > 0 && product.inStock !== false ? "in_stock" : "out_of_stock";
  }

  if (product.inStock === false || stock <= 0) {
    return "out_of_stock";
  }

  return "in_stock";
}

export function getAvailableStock(product = {}) {
  return resolveProductStatus(product) === "out_of_stock" ? 0 : Number(product.stock ?? 0);
}

export async function validateStockItems(items = []) {
  const normalizedItems = items
    .map((item) => ({
      productId: String(item?.productId || item?.id || "").trim(),
      qty: Number(item?.qty ?? 0),
    }))
    .filter((item) => item.productId && item.qty > 0);

  const uniqueIds = [...new Set(normalizedItems.map((item) => item.productId))];
  const products = await Product.find({ _id: { $in: uniqueIds } });
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  return normalizedItems.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      return {
        productId: item.productId,
        productName: "Unknown product",
        requestedQty: item.qty,
        availableStock: 0,
        status: "out_of_stock",
        isAvailable: false,
        reason: "missing",
      };
    }

    const status = resolveProductStatus(product);
    const availableStock = getAvailableStock(product);

    return {
      productId: product._id.toString(),
      productName: product.name,
      requestedQty: item.qty,
      availableStock,
      status,
      isAvailable: status !== "out_of_stock" && availableStock >= item.qty,
      reason: status === "out_of_stock" ? "out_of_stock" : availableStock < item.qty ? "insufficient_stock" : "available",
    };
  });
}

async function setAvailabilityFromStock(productId) {
  const product = await Product.findById(productId).select("stock inStock status");

  if (!product) {
    return;
  }

  const status = product.stock > 0 && product.inStock !== false ? "in_stock" : "out_of_stock";

  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        inStock: status === "in_stock",
        status,
      },
    }
  );
}

export async function reserveStockItems(items = []) {
  const normalizedItems = items
    .map((item) => ({
      productId: String(item?.productId || item?.id || "").trim(),
      qty: Number(item?.qty ?? 0),
    }))
    .filter((item) => item.productId && item.qty > 0);

  const reserved = [];

  for (const item of normalizedItems) {
    const product = await Product.findOneAndUpdate(
      {
        _id: item.productId,
        stock: { $gte: item.qty },
        status: { $ne: "out_of_stock" },
        inStock: { $ne: false },
      },
      { $inc: { stock: -item.qty } },
      { new: true }
    );

    if (!product) {
      await releaseStockItems(reserved);
      return { success: false };
    }

    reserved.push(item);
    await setAvailabilityFromStock(product._id);
  }

  return { success: true, reserved };
}

export async function releaseStockItems(items = []) {
  const normalizedItems = items
    .map((item) => ({
      productId: String(item?.productId || item?.id || "").trim(),
      qty: Number(item?.qty ?? 0),
    }))
    .filter((item) => item.productId && item.qty > 0);

  for (const item of normalizedItems) {
    await Product.findByIdAndUpdate(item.productId, { $inc: { stock: item.qty } });
    await setAvailabilityFromStock(item.productId);
  }
}
