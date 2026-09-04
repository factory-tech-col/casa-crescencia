import type { Product, Category } from "@/types";

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "cat-aretes",
    name: "Aretes",
    slug: "aretes",
    description: "Aretes artesanales",
    is_active: true,
    sort_order: 1,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "cat-pulseras",
    name: "Pulseras",
    slug: "pulseras",
    description: "Pulseras artesanales",
    is_active: true,
    sort_order: 2,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  },
];

export const ARETES_PRICE = 35000;
export const PULSERAS_PRICE = 70000;
export const PINAS_PRICE = 50000;

export interface CatalogEntry {
  slot: number;
  name: string;
  category: "Aretes" | "Pulseras";
}

// Real catalog mapping: slot (image number) -> product name.
// Aretes: 1-17 @ $35.000 | Pulseras: 18-30 @ $70.000
export const CATALOG: { aretes: string[]; pulseras: string[] } = {
  aretes: [
    "Terra",
    "Pollitos",
    "Conejos",
    "Monitos",
    "Sullivan",
    "Vaquitas",
    "Trebol de 4 hojas",
    "El Principito",
    "Fridas",
    "Piñas",
    "Mariposas",
    "Mafaldas",
    "Gatos",
    "Pensamientos",
    "Pokemón Espeon",
    "Pokemón Charmander",
    "Colombia",
  ],
  pulseras: [
    "Ángel",
    "Harry Potter",
    "Alpaca",
    "Acordeón",
    "Vírgen",
    "HelloKitty",
    "Sagrado Corazón",
    "Tobby",
    "Basketball",
    "Camiseta Selección Colombia",
    "San José",
    "Nombre de tu Hijo-a",
    "Vírgen de Guadalupe",
  ],
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function createProduct(entry: CatalogEntry): Product {
  const { slot, name, category } = entry;
  const price =
    name === "Piñas"
      ? PINAS_PRICE
      : category === "Aretes"
        ? ARETES_PRICE
        : PULSERAS_PRICE;
  const cat = DEFAULT_CATEGORIES.find((c) => c.name === category) || DEFAULT_CATEGORIES[0];
  return {
    id: `prod-${String(slot).padStart(3, "0")}`,
    name,
    slug: slugify(name),
    description: `${category} artesanal. ${name}`,
    price,
    currency: "COP",
    is_active: true,
    category_id: cat.id,
    order_index: slot,
    category: cat,
    images: [
      {
        id: `img-${String(slot).padStart(3, "0")}`,
        product_id: `prod-${String(slot).padStart(3, "0")}`,
        url: `${import.meta.env.BASE_URL}productos/${slot}.png`,
        alt_text: name,
        sort_order: 0,
        is_primary: true,
        created_at: "2024-01-01T00:00:00Z",
      },
    ],
    inventory: {
      id: `inv-${String(slot).padStart(3, "0")}`,
      product_id: `prod-${String(slot).padStart(3, "0")}`,
      stock: 20,
      reserved: 0,
      updated_at: "2024-01-01T00:00:00Z",
    },
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };
}

// Exactly 30 products: Aretes 1-17 (slots 1-17), Pulseras 1-13 (slots 18-30)
const DEFAULT_PRODUCTS: Product[] = [
  ...CATALOG.aretes.map((name, idx) =>
    createProduct({ slot: idx + 1, name, category: "Aretes" }),
  ),
  ...CATALOG.pulseras.map((name, idx) =>
    createProduct({ slot: 17 + (idx + 1), name, category: "Pulseras" }),
  ),
];

export { DEFAULT_PRODUCTS };