"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { refreshCart, refreshWishlist } from "@/store/commerceStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export type Product = {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  imageCover: string;
  images?: string[];
  price: number;
  priceAfterDiscount?: number;
  quantity: number;
  sold: number;
  ratingsAverage: number;
  ratingsQuantity?: number;
  createdAt?: string;
  category: { _id: string; name: string; image?: string };
  brand?: { _id: string; name: string; image?: string };
};

export function money(value: number) {
  return `${value.toLocaleString("en-US")} EGP`;
}

export function ProductCard({ product }: { product: Product }) {
  const discounted =
    typeof product.priceAfterDiscount === "number" &&
    product.priceAfterDiscount < product.price;
  const finalPrice = discounted && product.priceAfterDiscount
    ? product.priceAfterDiscount
    : product.price;

  const addToCart = async () => {
    try {
      await api.post("/cart", { productId: product._id });
      await refreshCart();
      toast.success("Added to cart");
    } catch {
      toast.error("Please login to add items to your cart");
    }
  };

  const toggleFavorite = async () => {
    try {
      await api.post("/wishlist", { productId: product._id });
      await refreshWishlist();
      toast.success("Added to wishlist");
    } catch {
      toast.error("Please login to manage your wishlist");
    }
  };

  return (
    <Card className="group pt-0 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/products/${product._id}`} className="relative block aspect-[4/4.2] overflow-hidden rounded-t-xl bg-muted">
        <img src={product.imageCover} alt={product.title} className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105" />
        {discounted && (
          <span className="absolute left-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-white">
            -{Math.round((1 - finalPrice / product.price) * 100)}%
          </span>
        )}
      </Link>
      <CardContent className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">{product.category?.name}</p>
        <Link href={`/products/${product._id}`} className="mt-1 line-clamp-2 min-h-10 text-sm font-bold leading-5 hover:text-primary">
          {product.title}
        </Link>
        <div className="mt-2 flex items-center gap-1 text-xs">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold">{product.ratingsAverage?.toFixed(1) || "0.0"}</span>
          <span className="text-muted-foreground">({product.ratingsQuantity || 0})</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div>
            {discounted && <p className="text-xs text-muted-foreground line-through">{money(product.price)}</p>}
            <p className="font-bold text-primary">{money(finalPrice)}</p>
          </div>
          <div className="flex gap-1">
            <Button size="icon-sm" variant="outline" aria-label="Add to wishlist" onClick={toggleFavorite}>
              <Heart className="size-4" />
            </Button>
            <Button size="icon-sm" aria-label="Add to cart" onClick={addToCart}>
              <ShoppingBag className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
