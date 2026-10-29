
/*
  VORIX CENTRAL PRODUCT CATALOGUE
  All prices and external purchase links must be configured from verified sources.
  Empty URLs mean that the product is not yet available for external purchase.
*/

window.VORIX_PRODUCTS = [
  {
    id: "vx-tee-001",
    name: "VOID Oversized Tee",
    category: "apparel",
    productType: "t-shirt",
    description: "A monochrome streetwear design built around a bold, minimal visual identity.",
    image: "assets/images/void-tee.svg",
    featured: true,
    availability: "available",
    options: {
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black"]
    },
    providers: [
      {
        id: "printful",
        name: "Printful",
        prices: { INR: null },
        lastUpdated: null,
        shipping: { description: "", verified: false },
        variants: {
          "Black-S": { externalProductUrl: "" },
          "Black-M": { externalProductUrl: "" },
          "Black-L": { externalProductUrl: "" },
          "Black-XL": { externalProductUrl: "" }
        },
        checkoutUrl: "",
        collectionUrl: ""
      },
      {
        id: "gelato",
        name: "Gelato",
        prices: { INR: null },
        lastUpdated: null,
        shipping: { description: "", verified: false },
        variants: {
          "Black-S": { externalProductUrl: "" },
          "Black-M": { externalProductUrl: "" },
          "Black-L": { externalProductUrl: "" },
          "Black-XL": { externalProductUrl: "" }
        },
        checkoutUrl: "",
        collectionUrl: ""
      }
    ]
  },
  {
    id: "vx-hoodie-001",
    name: "AFTER DARK Hoodie",
    category: "apparel",
    productType: "hoodie",
    description: "A dark, understated hoodie concept for a future VORIX collection.",
    image: "assets/images/after-dark.svg",
    featured: true,
    availability: "available",
    options: { sizes: ["S", "M", "L", "XL"], colors: ["Black"] },
    providers: []
  },
  {
    id: "vx-tee-002",
    name: "NO SIGNAL Tee",
    category: "apparel",
    productType: "t-shirt",
    description: "A graphic tee concept inspired by digital culture and urban isolation.",
    image: "assets/images/no-signal.svg",
    featured: true,
    availability: "available",
    options: { sizes: ["S", "M", "L", "XL"], colors: ["Black", "White"] },
    providers: []
  },
  {
    id: "vx-poster-001",
    name: "CONCRETE Study",
    category: "wall-art",
    productType: "poster",
    description: "A minimalist architectural poster concept for modern interiors.",
    image: "assets/images/concrete.svg",
    featured: true,
    availability: "available",
    options: { sizes: ["A4", "A3"], colors: [] },
    providers: []
  },
  {
    id: "vx-poster-002",
    name: "FORM No. 02",
    category: "wall-art",
    productType: "art-print",
    description: "An abstract geometric artwork concept with an editorial composition.",
    image: "assets/images/form-02.svg",
    featured: true,
    availability: "available",
    options: { sizes: ["A4", "A3"], colors: [] },
    providers: []
  },
  {
    id: "vx-digital-001",
    name: "VORIX Wallpaper Pack",
    category: "digital",
    productType: "digital-download",
    description: "A planned digital wallpaper collection for desktop and mobile devices.",
    image: "assets/images/wallpaper.svg",
    featured: true,
    availability: "available",
    options: { formats: ["PNG", "JPG"], sizes: [], colors: [] },
    providers: []
  },
  {
    id: "vx-digital-002",
    name: "Street Poster Toolkit",
    category: "digital",
    productType: "digital-download",
    description: "A planned digital design toolkit for creative projects.",
    image: "assets/images/toolkit.svg",
    featured: false,
    availability: "available",
    options: { formats: ["ZIP"], sizes: [], colors: [] },
    providers: []
  },
  {
    id: "vx-poster-003",
    name: "URBAN / 001",
    category: "wall-art",
    productType: "poster",
    description: "A street-inspired typography poster concept for contemporary spaces.",
    image: "assets/images/urban-001.svg",
    featured: false,
    availability: "available",
    options: { sizes: ["A4", "A3"], colors: [] },
    providers: []
  }
];
