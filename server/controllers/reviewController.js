import Review from "../models/Review.js";
import Product from "../models/Product.js";

export async function createReview(req, res, next) {
  try {
    const { productId, customerName, customerEmail, rating, title, content } = req.body;

    if (!productId || !customerName || !rating || !title || !content) {
      return res.status(400).json({ message: "productId, customerName, rating, title, and content are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = await Review.create({
      productId,
      customerName,
      customerEmail,
      rating: Number(rating),
      title,
      content,
      status: "pending",
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
}

export async function getReviews(req, res, next) {
  try {
    const { status, productId } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (productId) filter.productId = productId;

    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
}

export async function getReviewById(req, res, next) {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json(review);
  } catch (error) {
    next(error);
  }
}

export async function updateReview(req, res, next) {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json(review);
  } catch (error) {
    next(error);
  }
}

export async function deleteReview(req, res, next) {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function approveReview(req, res, next) {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json(review);
  } catch (error) {
    next(error);
  }
}

export async function rejectReview(req, res, next) {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json(review);
  } catch (error) {
    next(error);
  }
}
