// src/data/products.js
// ─────────────────────────────────────────────────────────────────
//  This is your LOCAL fallback product data.
//  Once you connect Firebase, products will load from Firestore.
//  Admin can add/edit/delete products from the Admin Panel.
// ─────────────────────────────────────────────────────────────────

export const WHATSAPP_NUMBER = "918960637300"; // ← REPLACE with client's number (no + or spaces)

export const CATEGORIES = [
  {
    name: "Toy Cars",
    subtitle: "Speed & Precision",
    img: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=700&q=85",
  },
  {
    name: "Showpieces",
    subtitle: "Artisan Décor",
    img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=700&q=85",
  },
  {
    name: "Soft Toys",
    subtitle: "Huggable Gifts",
    img: "https://plus.unsplash.com/premium_photo-1701984401514-a32a73eac549?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    name: "Gift Sets",
    subtitle: "Curated Collections",
    img: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=700&q=85",
  },
];

export const PRODUCTS = [
  {
    id: "p1",
    name: "Ferrari SF90 Stradale",
    category: "Toy Cars",
    price: 599,
    mrp: 899,
    rating: 4.8,
    reviews: 124,
    badge: "bestseller",
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=700&q=85",
    description:
      "Premium 1:18 scale Ferrari SF90 Stradale die-cast model with opening doors, detailed interior, and real rubber tyres. Comes in a collector display box. A must-have for car enthusiasts aged 6 and above.",
    features: ["1:18 Scale", "Opening Doors", "Die-Cast Metal", "Display Box"],
  },
  {
    id: "p2",
    name: "Lamborghini Huracán",
    category: "Toy Cars",
    price: 449,
    mrp: 699,
    rating: 4.7,
    reviews: 89,
    badge: "new",
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=700&q=85",
    description:
      "1:32 scale Lamborghini Huracán with pull-back friction motor. Set of 2 in assorted colours. Lightweight, durable and perfectly detailed for ages 3 and above.",
    features: ["1:32 Scale", "Pull-Back Motor", "Set of 2", "Ages 3+"],
  },
  {
    id: "p3",
    name: "Vintage Porsche 911",
    category: "Toy Cars",
    price: 799,
    mrp: 1199,
    rating: 4.9,
    reviews: 43,
    badge: "bestseller",
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=700&q=85",
    description:
      "Classic 1:18 scale Porsche 911 die-cast with authentic period detailing and chrome accents. Collector's edition with premium acrylic display stand included.",
    features: ["1:18 Scale", "Collector Edition", "Chrome Accents", "Display Stand"],
  },
  {
    id: "p4",
    name: "RC Drift Car Pro",
    category: "Toy Cars",
    price: 1299,
    mrp: 1799,
    rating: 4.8,
    reviews: 156,
    badge: "bestseller",
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=85",
    description:
      "2.4GHz remote-controlled drift car with 360° spin mode, LED headlights and up to 30m range. Rechargeable battery and USB charging cable included.",
    features: ["2.4GHz Control", "360° Drift Mode", "LED Lights", "Rechargeable"],
  },
  {
    id: "p5",
    name: "Monster Truck Pack",
    category: "Toy Cars",
    price: 349,
    mrp: 499,
    rating: 4.6,
    reviews: 67,
    badge: null,
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=700&q=85",
    description:
      "Pack of 3 monster trucks with oversized wheels and bright designs. Made from BPA-free durable plastic. Safe and fun for kids aged 3 and above.",
    features: ["Pack of 3", "Oversized Wheels", "BPA-Free", "Ages 3+"],
  },
  {
    id: "p6",
    name: "Car Track Set Deluxe",
    category: "Toy Cars",
    price: 899,
    mrp: 1299,
    rating: 4.5,
    reviews: 78,
    badge: "new",
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=700&q=85",
    description:
      "Complete loop-track set with 2 toy cars, 3 loops and jump ramps. Easy snap-together assembly. Great for ages 4 and above.",
    features: ["2 Cars Included", "3 Loop Ramps", "Easy Assembly", "Ages 4+"],
  },
  {
    id: "p7",
    name: "Crystal Angel Figurine",
    category: "Showpieces",
    price: 699,
    mrp: 999,
    rating: 4.7,
    reviews: 112,
    badge: null,
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=700&q=85",
    description:
      "Hand-crafted crystal angel figurine with exquisite detailing and a frosted glass finish. A timeless piece for home décor or as a heartfelt gift.",
    features: ["Hand-Crafted", "Crystal Glass", "Frosted Finish", "Gift Box Included"],
  },
  {
    id: "p8",
    name: "Wooden Elephant Pair",
    category: "Showpieces",
    price: 549,
    mrp: 799,
    rating: 4.6,
    reviews: 88,
    badge: "new",
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=700&q=85",
    description:
      "Handcrafted wooden elephant pair in natural teak finish with intricate carved detailing. Symbol of wisdom, strength and good fortune.",
    features: ["Teak Wood", "Hand-Carved", "Set of 2", "Lucky Symbol"],
  },
  {
    id: "p9",
    name: "LED Rotating Globe",
    category: "Showpieces",
    price: 899,
    mrp: 1299,
    rating: 4.8,
    reviews: 64,
    badge: "new",
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1521405924368-64c5b84bec60?w=700&q=85",
    description:
      "Elegant rotating world globe with warm LED base lighting. Smooth rotation motor with on/off switch. A sophisticated accent for any office, study or living room.",
    features: ["LED Base", "Rotating Motor", "On/Off Switch", "Premium Finish"],
  },
  {
    id: "p10",
    name: "Premium Teddy Bear",
    category: "Soft Toys",
    price: 399,
    mrp: 599,
    rating: 4.9,
    reviews: 203,
    badge: "bestseller",
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1566140967404-b8b3932483f5?w=700&q=85",
    description:
      "Ultra-soft premium teddy bear in a beautiful gift-ready box. Made from hypoallergenic velboa fabric. The perfect birthday or anniversary surprise for all ages.",
    features: ["Hypoallergenic", "Gift Box", "Ultra-Soft Velboa", "All Ages"],
  },
  {
    id: "p11",
    name: "Plush Unicorn Set",
    category: "Soft Toys",
    price: 499,
    mrp: 699,
    rating: 4.7,
    reviews: 145,
    badge: null,
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1558618047-f4e60cfe8b1a?w=700&q=85",
    description:
      "Set of 3 pastel unicorn plush toys in ultra-soft velboa fabric. Safe for all ages with stitched eyes (no buttons). Irresistibly cute and great for gifting.",
    features: ["Set of 3", "Pastel Colours", "Stitched Eyes", "All Ages Safe"],
  },
  {
    id: "p12",
    name: "Luxury Gift Hamper",
    category: "Gift Sets",
    price: 1499,
    mrp: 1999,
    rating: 4.9,
    reviews: 87,
    badge: "new",
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1512909006721-3d6018887383?w=700&q=85",
    description:
      "Curated luxury gift hamper including a premium die-cast toy car, plush teddy, crystal showpiece and gold-ribbon wrapped premium box. The ultimate gifting experience for any occasion.",
    features: ["4 Premium Items", "Gold Ribbon Box", "Any Occasion", "Free Gift Card"],
  },
  {
    id: "p13",
    name: "Birthday Surprise Box",
    category: "Gift Sets",
    price: 899,
    mrp: 1299,
    rating: 4.8,
    reviews: 62,
    badge: null,
    inStock: true,
    imageUrl: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=700&q=85",
    description:
      "Beautifully decorated surprise box filled with curated birthday gifts. Includes personalised ribbon and a printed greeting card.",
    features: ["Surprise Items", "Personalised Ribbon", "Greeting Card", "Birthday Theme"],
  },
];

export const ORDER_STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered"];

export const DELIVERY_INFO = {
  freeAbove: 999,
  charge: 60,
  estimatedDays: "3–7 business days",
};
