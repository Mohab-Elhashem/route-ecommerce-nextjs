"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard, LockKeyhole, MapPin } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import {
  getCommerceSnapshot,
  refreshCart,
  subscribeCommerce,
} from "@/store/commerceStore";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Address = {
  _id: string;
  name?: string;
  details: string;
  phone: string;
  city: string;
};

type ShippingAddress = {
  details: string;
  phone: string;
  city: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const commerce = useSyncExternalStore(
    subscribeCommerce,
    getCommerceSnapshot,
    getCommerceSnapshot,
  );
  const { token } = useAppSelector((state) => state.auth);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [details, setDetails] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [payment, setPayment] = useState<"cash" | "online">("cash");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void refreshCart();
    if (!token) return;
    void api
      .get<{ data: Address[] }>("/addresses")
      .then(({ data }) => setAddresses(data.data))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, [token]);

  const chosenAddress = (): ShippingAddress | null => {
    if (selectedAddress) {
      const address = addresses.find((item) => item._id === selectedAddress);
      if (address) return { details: address.details, phone: address.phone, city: address.city };
    }
    if (details.trim() && phone.trim() && city.trim()) {
      return { details: details.trim(), phone: phone.trim(), city: city.trim() };
    }
    return null;
  };

  const submitOrder = async () => {
    if (!token) {
      router.push("/login");
      return;
    }
    if (!commerce.cart?._id) {
      toast.error("Your cart is empty");
      return;
    }
    const shippingAddress = chosenAddress();
    if (!shippingAddress) {
      toast.error("Choose a saved address or enter a new address");
      return;
    }

    setSubmitting(true);
    try {
      if (payment === "cash") {
        await api.post(`/orders/${commerce.cart._id}`, { shippingAddress });
        await refreshCart();
        toast.success("Cash order placed successfully");
        router.push("/allorders");
        return;
      }

      const successUrl = `${window.location.origin}/allorders`;
      const { data } = await api.post<{
        session?: { url?: string };
        url?: string;
      }>(`/orders/checkout-session/${commerce.cart._id}?url=${encodeURIComponent(successUrl)}`, {
        shippingAddress,
      });
      const paymentUrl = data.session?.url || data.url;
      if (!paymentUrl) throw new Error("Payment URL not returned");
      window.location.assign(paymentUrl);
    } catch {
      toast.error("Could not complete the order");
      setSubmitting(false);
    }
  };

  if (!commerce.cart?.products.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Button className="mt-5" nativeButton={false} render={<Link href="/products" />}>Continue shopping</Button>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Login required</h1>
        <Button className="mt-5" nativeButton={false} render={<Link href="/login" />}>Login to checkout</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Secure checkout</p>
      <h1 className="mt-1 text-3xl font-bold">Complete your order</h1>
      {loading ? (
        <div className="mt-7 grid gap-6 md:grid-cols-[1fr_340px]"><Skeleton className="h-[520px] rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>
      ) : (
        <div className="mt-7 grid gap-6 md:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            <section className="rounded-xl border p-5">
              <h2 className="flex items-center gap-2 font-bold"><MapPin className="size-4 text-primary" /> Shipping address</h2>
              {addresses.length > 0 && (
                <div className="mt-4 space-y-2">
                  {addresses.map((address) => (
                    <label key={address._id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${selectedAddress === address._id ? "border-primary bg-primary/5" : ""}`}>
                      <input type="radio" name="address" value={address._id} checked={selectedAddress === address._id} onChange={() => setSelectedAddress(address._id)} className="mt-1" />
                      <span><strong className="block text-sm">{address.name || "Saved address"}</strong><span className="text-sm text-muted-foreground">{address.details}, {address.city} - {address.phone}</span></span>
                    </label>
                  ))}
                </div>
              )}
              <div className="mt-4 grid gap-3">
                <button type="button" onClick={() => setSelectedAddress("")} className={`rounded-lg border p-3 text-left text-sm font-semibold ${!selectedAddress ? "border-primary bg-primary/5" : ""}`}>Enter a new address</button>
                {!selectedAddress && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Address details" className="h-10 rounded-lg border bg-background px-3 text-sm sm:col-span-2" />
                    <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" className="h-10 rounded-lg border bg-background px-3 text-sm" />
                    <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" className="h-10 rounded-lg border bg-background px-3 text-sm" />
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-xl border p-5">
              <h2 className="flex items-center gap-2 font-bold"><CreditCard className="size-4 text-primary" /> Payment method</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className={`cursor-pointer rounded-xl border p-4 ${payment === "cash" ? "border-primary bg-primary/5" : ""}`}>
                  <input type="radio" name="payment" value="cash" checked={payment === "cash"} onChange={() => setPayment("cash")} />
                  <span className="ml-2 font-semibold">Cash on delivery</span>
                  <p className="mt-2 text-xs text-muted-foreground">Pay when your order arrives.</p>
                </label>
                <label className={`cursor-pointer rounded-xl border p-4 ${payment === "online" ? "border-primary bg-primary/5" : ""}`}>
                  <input type="radio" name="payment" value="online" checked={payment === "online"} onChange={() => setPayment("online")} />
                  <span className="ml-2 font-semibold">Online payment</span>
                  <p className="mt-2 text-xs text-muted-foreground">Redirect to secure payment gateway.</p>
                </label>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-xl border bg-card p-5 md:sticky md:top-24">
            <h2 className="font-bold">Order summary</h2>
            <div className="mt-4 flex justify-between border-t pt-4 text-sm"><span className="text-muted-foreground">Items</span><span className="font-semibold">{commerce.cartCount}</span></div>
            <div className="mt-3 flex justify-between"><span className="font-semibold">Total</span><span className="text-xl font-black text-primary">{commerce.cart.totalCartPrice} EGP</span></div>
            <Button size="lg" className="mt-5 w-full" disabled={submitting} onClick={submitOrder}>
              {submitting ? "Processing..." : <><LockKeyhole className="size-4" /> {payment === "cash" ? "Place cash order" : "Pay online"}</>}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground"><CheckCircle2 className="size-3.5" /> Secure checkout</p>
          </aside>
        </div>
      )}
    </div>
  );
}
