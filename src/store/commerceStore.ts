"use client";

import { api } from "@/lib/api";

export type CartProduct = {
  _id: string;
  title: string;
  imageCover: string;
  price: number;
  priceAfterDiscount?: number;
  ratingsAverage?: number;
  quantity?: number;
};

export type CartItem = {
  _id: string;
  count: number;
  product: CartProduct;
};

export type CartData = {
  _id: string;
  cartOwner: string;
  products: CartItem[];
  totalCartPrice: number;
};

type CommerceSnapshot = {
  cartCount: number;
  wishlistCount: number;
  cart: CartData | null;
  wishlist: CartProduct[];
};

let snapshot: CommerceSnapshot = {
  cartCount: 0,
  wishlistCount: 0,
  cart: null,
  wishlist: [],
};

const listeners = new Set<() => void>();

function publish(next: Partial<CommerceSnapshot>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((listener) => listener());
}

export function subscribeCommerce(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCommerceSnapshot() {
  return snapshot;
}

export async function refreshCart() {
  try {
    const { data } = await api.get<{
      numOfCartItems: number;
      data: CartData;
    }>("/cart");
    publish({ cart: data.data, cartCount: data.numOfCartItems });
  } catch {
    publish({ cart: null, cartCount: 0 });
  }
}

export async function refreshWishlist() {
  try {
    const { data } = await api.get<{ count: number; data: CartProduct[] }>("/wishlist");
    publish({ wishlist: data.data, wishlistCount: data.count ?? data.data.length });
  } catch {
    publish({ wishlist: [], wishlistCount: 0 });
  }
}

export async function clearCommerceCounts() {
  publish({ cart: null, cartCount: 0, wishlist: [], wishlistCount: 0 });
}
