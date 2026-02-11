const PRODUCT_NAMES = [
  "iPhone 15 128GB",
  "Samsung Galaxy S24",
  "MacBook Air M2",
  "Sony WH-1000XM5",
  "Dell XPS 13",
  "Apple Watch Series 9",
  "iPad Pro 11",
  "Canon EOS R50",
  "PlayStation 5",
  "Bose Soundbar 900",
];

const PRODUCT_IMAGES = [
  "https://images.unsplash.com/photo-1695048133142-1a20484d2569",
  "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
  "https://images.unsplash.com/photo-1518444065439-e933c06ce9cd",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
  "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b",
  "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0",
  "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c",
  "https://images.unsplash.com/photo-1606813907291-d86efa9b94db",
  "https://images.unsplash.com/photo-1589003077984-894e133dabab",
];

function generateProducts(priceAdjustments) {
  return PRODUCT_NAMES.map((name, i) => ({
    id: `${i + 1}`,
    name,
    price: priceAdjustments[i],
    rating: +(4.2 + Math.random() * 0.6).toFixed(1),
    reviews: 2000 + i * 1200,
    inStock: i % 2 === 0,
    deliveryDays: 2 + (i % 4),
    image: PRODUCT_IMAGES[i],
    url: "#",
    priceHistory: [
      priceAdjustments[i] + 110,
      priceAdjustments[i] + 40,
      priceAdjustments[i] + 70,
    ],
  }));
}

export const MOCK_API_DATA = {
  amazon: {
    products: generateProducts([
      799, 749, 1099, 349, 999, 399, 899, 879, 499, 699,
    ]),
  },
  ebay: {
    products: generateProducts([
      780, 730, 1075, 329, 950, 379, 870, 850, 480, 670,
    ]),
  },
  walmart: {
    products: generateProducts([
      805, 760, 1100, 355, 990, 410, 910, 890, 510, 720,
    ]),
  },
};
