"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  getCommerceSnapshot,
  refreshCart,
  refreshWishlist,
  subscribeCommerce,
} from "@/store/commerceStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function WishlistPage() {
  const commerce = useSyncExternalStore(
    subscribeCommerce,
    getCommerceSnapshot,
    getCommerceSnapshot,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refreshWishlist().finally(() => setLoading(false));
  }, []);

  const removeItem = async (productId: string) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      await refreshWishlist();
      toast.success("Removed from wishlist");
    } catch {
      toast.error("Could not remove the product");
    }
  };

  const addToCart = async (productId: string) => {
    try {
      await api.post("/cart", { productId });
      await refreshCart();
      toast.success("Moved to cart");
    } catch {
      toast.error("Please login to add items to your cart");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Saved items</p>
        <h1 className="mt-1 text-3xl font-bold">Wishlist</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[360px] rounded-xl" />)}</div>
      ) : !commerce.wishlist.length ? (
        <div className="rounded-2xl border py-20 text-center">
          <Heart className="mx-auto size-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-bold">Your wishlist is empty</h2>
          <Button className="mt-5" nativeButton={false} render={<Link href="/products" />}>Discover products</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {commerce.wishlist.map((product) => (
            <Card key={product._id} className="pt-0">
              <Link href={`/products/${product._id}`} className="relative aspect-[4/4.2] overflow-hidden rounded-t-xl bg-muted">
                <Image src={product.imageCover} alt={product.title} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-contain p-3" />
              </Link>
              <CardContent className="p-4">
                <Link href={`/products/${product._id}`} className="line-clamp-2 min-h-10 font-bold hover:text-primary">{product.title}</Link>
                <p className="mt-3 font-black text-primary">{product.priceAfterDiscount || product.price} EGP</p>
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1" size="sm" onClick={() => addToCart(product._id)}><ShoppingBag className="size-4" /> Add to cart</Button>
                  <Button size="icon-sm" variant="outline" className="text-destructive" aria-label="Remove from wishlist" onClick={() => removeItem(product._id)}><Trash2 className="size-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
