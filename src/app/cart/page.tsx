"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  getCommerceSnapshot,
  refreshCart,
  subscribeCommerce,
} from "@/store/commerceStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartPage() {
  const commerce = useSyncExternalStore(
    subscribeCommerce,
    getCommerceSnapshot,
    getCommerceSnapshot,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void refreshCart().finally(() => setLoading(false));
  }, []);

  const updateQuantity = async (productId: string, count: number) => {
    if (count < 1) return;
    try {
      await api.put(`/cart/${productId}`, { count });
      await refreshCart();
      toast.success("Cart quantity updated");
    } catch {
      toast.error("Could not update the quantity");
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await api.delete(`/cart/${productId}`);
      await refreshCart();
      toast.success("Product removed from cart");
    } catch {
      toast.error("Could not remove the product");
    }
  };

  const clearCart = async () => {
    try {
      await api.delete("/cart");
      await refreshCart();
      toast.success("Cart cleared");
    } catch {
      toast.error("Could not clear the cart");
    }
  };

  const cart = commerce.cart;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Your bag</p>
        <h1 className="mt-1 text-3xl font-bold">Shopping Cart</h1>
      </div>

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-xl" />)}</div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      ) : !cart?.products.length ? (
        <div className="rounded-2xl border py-20 text-center">
          <ShoppingBag className="mx-auto size-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-bold">Your cart is empty</h2>
          <Button className="mt-5" nativeButton={false} render={<Link href="/products" />}>Continue shopping</Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-3">
            {cart.products.map((item) => (
              <div key={item._id} className="flex gap-4 rounded-xl border p-4">
                <Link href={`/products/${item.product._id}`} className="relative size-28 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-32">
                  <Image src={item.product.imageCover} alt={item.product.title} fill sizes="128px" className="object-contain p-2" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link href={`/products/${item.product._id}`} className="font-bold hover:text-primary">{item.product.title}</Link>
                  <p className="mt-2 text-lg font-black text-primary">{item.product.priceAfterDiscount || item.product.price} EGP</p>
                  <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    <div className="flex h-9 items-center rounded-lg border">
                      <Button size="icon-sm" variant="ghost" disabled={item.count <= 1} onClick={() => updateQuantity(item.product._id, item.count - 1)}><Minus /></Button>
                      <span className="w-10 text-center text-sm font-bold">{item.count}</span>
                      <Button size="icon-sm" variant="ghost" onClick={() => updateQuantity(item.product._id, item.count + 1)}><Plus /></Button>
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeItem(item.product._id)}><Trash2 className="size-4" /> Remove</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="h-fit rounded-xl border bg-card p-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold">Order Summary</h2>
            <div className="mt-5 flex justify-between text-sm"><span className="text-muted-foreground">Items</span><span className="font-semibold">{commerce.cartCount}</span></div>
            <div className="mt-3 flex justify-between border-t pt-4"><span className="font-semibold">Total</span><span className="text-xl font-black text-primary">{cart.totalCartPrice} EGP</span></div>
            <Button size="lg" className="mt-5 w-full" nativeButton={false} render={<Link href="/checkout" />}>Proceed to checkout</Button>
            <Button size="lg" variant="outline" className="mt-2 w-full text-destructive" onClick={clearCart}><Trash2 className="size-4" /> Clear cart</Button>
          </aside>
        </div>
      )}
    </div>
  );
}
