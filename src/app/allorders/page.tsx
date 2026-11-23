"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PackageCheck, Truck, CreditCard } from "lucide-react";
import { api } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Order = {
  _id: string;
  id?: number;
  createdAt: string;
  totalOrderPrice: number;
  paymentMethodType: "cash" | "card";
  isPaid: boolean;
  isDelivered: boolean;
  shippingAddress: { details: string; phone: string; city: string };
  cartItems: Array<{
    _id: string;
    count: number;
    price: number;
    product: { _id: string; title: string; imageCover: string };
  }>;
};

export default function AllOrdersPage() {
  const { token } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    void api
      .get<{ data: Order[] }>("/orders/user")
      .then(({ data }) => setOrders(data.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Login required</h1>
        <Button className="mt-5" nativeButton={false} render={<Link href="/login" />}>Login</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Account</p>
      <h1 className="mt-1 text-3xl font-bold">My Orders</h1>

      {loading ? (
        <div className="mt-7 space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}</div>
      ) : orders.length ? (
        <div className="mt-7 space-y-5">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
                  <div><p className="text-xs text-muted-foreground">Order</p><p className="font-bold">#{order.id || order._id.slice(-8)}</p></div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${order.isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{order.isPaid ? "Paid" : "Unpaid"}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${order.isDelivered ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}>{order.isDelivered ? "Delivered" : "Not delivered"}</span>
                  </div>
                </div>
                <div className="grid gap-5 py-4 lg:grid-cols-[1fr_240px]">
                  <div className="space-y-3">
                    {order.cartItems.map((item) => (
                      <Link key={item._id} href={`/products/${item.product._id}`} className="flex items-center gap-3 rounded-lg border p-3">
                        <img src={item.product.imageCover} alt={item.product.title} className="size-16 rounded-lg bg-muted object-contain p-1" />
                        <div className="min-w-0 flex-1"><p className="truncate font-semibold">{item.product.title}</p><p className="mt-1 text-xs text-muted-foreground">Qty: {item.count}</p></div>
                        <p className="font-bold text-primary">{item.price} EGP</p>
                      </Link>
                    ))}
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 font-semibold"><CreditCard className="size-4 text-primary" /> {order.paymentMethodType === "cash" ? "Cash on delivery" : "Online payment"}</div>
                    <div className="flex items-start gap-2"><Truck className="mt-0.5 size-4 text-primary" /><span className="text-muted-foreground">{order.shippingAddress.details}, {order.shippingAddress.city}<br />{order.shippingAddress.phone}</span></div>
                    <div className="flex justify-between border-t pt-3"><span className="font-semibold">Total</span><span className="text-lg font-black text-primary">{order.totalOrderPrice} EGP</span></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-xl border py-16 text-center"><PackageCheck className="mx-auto size-12 text-muted-foreground" /><h2 className="mt-3 font-bold">No orders yet</h2><Button className="mt-5" nativeButton={false} render={<Link href="/products" />}>Start shopping</Button></div>
      )}
    </div>
  );
}
