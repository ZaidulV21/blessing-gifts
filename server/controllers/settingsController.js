import Settings from "../models/Settings.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

export async function getSettings(req, res, next) {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        storeName: "Blessing Gifts",
      });
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req, res, next) {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      settings = await Settings.findByIdAndUpdate(settings._id, req.body, { new: true });
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
}

export async function getAnalytics(req, res, next) {
  try {

    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const totalCustomers = await Order.aggregate([
      { $group: { _id: "$phone" } },
      { $count: "count" },
    ]);

    // Monthly sales
    const monthlySales = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
    ]);

    // Top products
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          quantity: { $sum: "$items.qty" },
          revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      totalOrders,
      totalProducts,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalCustomers: totalCustomers[0]?.count || 0,
      monthlySales,
      topProducts,
    });
  } catch (error) {
    next(error);
  }
}
