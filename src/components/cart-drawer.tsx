"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function CartDrawer({ children }: { children: React.ReactNode }) {
  const commerce = useSyncExternalStore(
    subscribeCommerce,
    getCommerceSnapshot,
    getCommerceSnapshot,
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) void refreshCart();
  }, [open]);

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
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            aria-label="Cart"
            className="relative grid size-8 place-items-center rounded-lg transition hover:bg-accent"
          />
        }
      >
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-[92vw] p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Shopping Cart ({commerce.cartCount})</SheetTitle>
        </SheetHeader>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {!cart?.products.length ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <ShoppingBag className="mx-auto size-10 text-muted-foreground" />
                <p className="mt-3 font-semibold">Your cart is empty</p>
                <Link href="/products" className="mt-2 block text-sm text-primary hover:underline">Browse products</Link>
              </div>
            </div>
          ) : (
            cart.products.map((item) => (
              <div key={item._id} className="flex gap-3 rounded-xl border p-3">
                <Image src={item.product.imageCover} alt={item.product.title} width={80} height={80} className="size-20 rounded-lg bg-muted object-contain p-1" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold">{item.product.title}</p>
                  <p className="mt-1 text-sm font-bold text-primary">{item.product.priceAfterDiscount || item.product.price} EGP</p>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex h-8 items-center rounded-lg border">
                      <Button size="icon-xs" variant="ghost" disabled={item.count <= 1} onClick={() => updateQuantity(item.product._id, item.count - 1)}><Minus /></Button>
                      <span className="w-8 text-center text-xs font-bold">{item.count}</span>
                      <Button size="icon-xs" variant="ghost" onClick={() => updateQuantity(item.product._id, item.count + 1)}><Plus /></Button>
                    </div>
                    <Button size="icon-xs" variant="ghost" className="text-destructive" aria-label="Remove item" onClick={() => removeItem(item.product._id)}><Trash2 /></Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {cart?.products.length ? (
          <SheetFooter className="border-t">
            <div className="mb-2 flex items-center justify-between"><span className="text-muted-foreground">Total</span><span className="text-lg font-black">{cart.totalCartPrice} EGP</span></div>
            <Button nativeButton={false} render={<Link href="/checkout" />}>Proceed to checkout</Button>
            <Button variant="outline" className="text-destructive" onClick={clearCart}><Trash2 className="size-4" /> Clear cart</Button>
            <Link href="/cart" className="text-center text-sm font-semibold text-primary hover:underline">View full cart</Link>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
