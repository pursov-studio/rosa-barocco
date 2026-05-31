import type { Category, Product, Review } from "./types";

import catSilver from "@/assets/category-silver.jpg";
import catGold from "@/assets/category-gold.jpg";
import catPlatinum from "@/assets/category-platinum.jpg";

export const categories: Category[] = [
  {
    slug: "platinum-lux",
    name: "Коллоидная платина PLATINUM LUX",
    shortName: "PLATINUM LUX",
    metal: "platinum",
    description: "Премиальная линия с коллоидной платиной.",
    image: catPlatinum,
  },
  {
    slug: "gold-chic",
    name: "Коллоидное золото GOLD CHIC",
    shortName: "GOLD CHIC",
    metal: "gold",
    description: "Премиальная линия с коллоидным золотом.",
    image: catGold,
  },
  {
    slug: "platinum",
    name: "Коллоидный раствор платины",
    shortName: "Платина",
    metal: "platinum",
    image: catPlatinum,
  },
  {
    slug: "gold",
    name: "Коллоидный раствор золота",
    shortName: "Золото",
    metal: "gold",
    image: catGold,
  },
  {
    slug: "silver-universal",
    name: "Коллоидное серебро SILVER UNIVERSAL",
    shortName: "SILVER UNIVERSAL",
    metal: "silver",
    image: catSilver,
  },
  {
    slug: "silver-anti-acne",
    name: "Коллоидное серебро SILVER ANTI-ACNE",
    shortName: "SILVER ANTI-ACNE",
    metal: "silver",
    image: catSilver,
  },
  {
    slug: "sets",
    name: "Наборы средств",
    shortName: "Наборы",
    metal: "mix",
    description: "Подарочные наборы и комплекты.",
  },
];

export const products: Product[] = [
  {
    id: "p1",
    slug: "platinum-lux-110",
    sku: "PLT-LUX-110",
    name: "PLATINUM LUX 110 мл",
    categorySlug: "platinum-lux",
    price: 1563,
    currency: "RUB",
    volumeMl: 110,
    weightG: 115,
    composition: "Коллоидная платина",
    shortDescription: "Спрей-мист для ухода за кожей с коллоидной платиной.",
    areas: ["лицо", "тело", "зона декольте", "руки"],
    skinType: ["все типы кожи", "зрелая", "нормальная"],
    usage:
      "Встряхните флакон. Распылите на очищенную кожу утром и вечером. Можно добавлять в косметические средства.",
    images: [],
    inStock: true,
  },
  {
    id: "p2",
    slug: "gold-chic-110",
    sku: "GLD-CHC-110",
    name: "GOLD CHIC 110 мл",
    categorySlug: "gold-chic",
    price: 1453,
    currency: "RUB",
    volumeMl: 110,
    weightG: 110,
    composition: "Коллоидное золото",
    shortDescription: "Спрей-мист для ухода за кожей с коллоидным золотом.",
    areas: ["лицо", "тело", "зона декольте", "руки"],
    skinType: ["все типы кожи", "зрелая", "комбинированная"],
    usage:
      "Встряхните флакон. Равномерно распылите на очищенную кожу. Можно использовать для обогащения косметических средств.",
    images: [],
    inStock: true,
  },
  {
    id: "p3",
    slug: "gold-chic-100",
    sku: "GLD-CHC-100",
    name: "GOLD CHIC 100 мл",
    categorySlug: "gold-chic",
    price: 945,
    currency: "RUB",
    volumeMl: 100,
    weightG: 120,
    composition: "Коллоидное золото",
    shortDescription: "Спрей для ухода за кожей с коллоидным золотом.",
    areas: ["шея", "зона декольте", "лицо", "тело"],
    skinType: ["все типы кожи", "зрелая", "комбинированная"],
    usage:
      "Распылите на очищенную кожу лица, декольте, рук и тела утром, вечером или в течение дня.",
    images: [],
    inStock: true,
  },
  {
    id: "p4",
    slug: "platinum-100",
    sku: "PLT-100",
    name: "Коллоидная платина 100 мл",
    categorySlug: "platinum",
    price: 985,
    currency: "RUB",
    volumeMl: 100,
    composition: "Коллоидная платина",
    shortDescription: "Спрей-мист с коллоидной платиной для ежедневного ухода.",
    areas: ["лицо", "зона декольте", "область вокруг глаз", "руки"],
    usage:
      "Распыляйте на очищенную кожу утром, вечером и в течение дня перед нанесением крема, сыворотки, маски или патчей.",
    images: [],
    inStock: true,
  },
  {
    id: "p5",
    slug: "gold-100",
    sku: "GLD-100",
    name: "Коллоидное золото 100 мл",
    categorySlug: "gold",
    price: 954,
    currency: "RUB",
    volumeMl: 100,
    weightG: 120,
    composition: "Коллоидное золото",
    shortDescription: "Спрей для ухода за кожей с коллоидным золотом.",
    areas: ["шея", "зона декольте", "лицо", "тело"],
    skinType: ["все типы кожи", "зрелая", "комбинированная"],
    usage:
      "Встряхните флакон. Распылите на очищенную кожу утром, вечером или в течение дня.",
    images: [],
    inStock: true,
  },
  {
    id: "p6",
    slug: "silver-universal",
    sku: "SLV-UNI-100",
    name: "SILVER UNIVERSAL 100 мл",
    categorySlug: "silver-universal",
    price: 534,
    currency: "RUB",
    volumeMl: 100,
    weightG: 100,
    composition:
      "Коллоидное серебро, хелат, очищенная вода, дистиллированная вода, стабилизатор",
    shortDescription: "Универсальный спрей-тонер для ежедневного ухода.",
    areas: ["лицо", "тело"],
    usage: "Распыляйте на нужную область кожи.",
    images: [],
    inStock: true,
  },
  {
    id: "p7",
    slug: "silver-anti-acne",
    sku: "SLV-ACN-100",
    name: "SILVER ANTI-ACNE 100 мл",
    categorySlug: "silver-anti-acne",
    price: 564,
    currency: "RUB",
    volumeMl: 100,
    composition:
      "Деминерализованная вода, серебро, хелат, дистиллированная вода, стабилизатор",
    shortDescription: "Спрей для проблемной кожи, склонной к высыпаниям.",
    target: "проблемная кожа",
    usage: "Используйте как спрей для ухода за кожей.",
    images: [],
    inStock: true,
  },
  {
    id: "p8",
    slug: "set-diamant-lux",
    sku: "SET-DMT-LUX",
    name: "Набор DIAMANT LUX",
    categorySlug: "sets",
    price: 2450,
    currency: "RUB",
    shortDescription:
      "Набор из коллоидной платины и золота, по 110 мл, 2 флакона.",
    images: [],
    inStock: true,
    isSet: true,
    bundleItems: ["platinum-lux-110", "gold-chic-110"],
  },
  {
    id: "p9",
    slug: "set-diamant-collection",
    sku: "SET-DMT-COL",
    name: "Набор DIAMANT COLLECTION",
    categorySlug: "sets",
    price: 2352,
    currency: "RUB",
    shortDescription:
      "Набор из коллоидной платины, золота и серебра, по 100 мл, 3 флакона.",
    images: [],
    inStock: true,
    isSet: true,
    bundleItems: ["platinum-100", "gold-100", "silver-universal"],
  },
];

export const reviews: Review[] = [
  {
    id: "r1",
    author: "Марина",
    text: "Очень довольна качеством коллоидного серебра от ROSA&BAROCCO. Пользуюсь регулярно и замечаю отличный результат.",
  },
  {
    id: "r2",
    author: "Светлана",
    text: "Давно искала натуральные растворы платины — и только в ROSA&BAROCCO нашла нужный продукт. Спасибо за отличную продукцию.",
  },
  {
    id: "r3",
    author: "Ирина",
    text: "Покупала коллоидное серебро для всей семьи. ROSA&BAROCCO — надёжный продавец, рекомендую.",
  },
];

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}
export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}
export function getProductsByCategory(slug: string) {
  return products.filter((p) => p.categorySlug === slug);
}
