export function getAvailableStock(product = {}) {
  const stock = Number(product.stock ?? 0);
  const status = product.status || (product.inStock === false || stock <= 0 ? "out_of_stock" : "in_stock");

  return status === "out_of_stock" ? 0 : stock;
}

export function isOutOfStock(product = {}) {
  return getAvailableStock(product) <= 0;
}
