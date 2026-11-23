"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Address = {
  _id: string;
  name?: string;
  details: string;
  phone: string;
  city: string;
};

export default function AddressesPage() {
  const { token } = useAppSelector((state) => state.auth);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ data: Address[] }>("/addresses");
      setAddresses(data.data);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    void api
      .get<{ data: Address[] }>("/addresses")
      .then(({ data }) => setAddresses(data.data))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, [token]);

  const addAddress = async () => {
    if (!details.trim() || !phone.trim() || !city.trim()) {
      toast.error("Complete all address fields");
      return;
    }
    try {
      await api.post("/addresses", {
        name: name.trim() || "Saved address",
        details: details.trim(),
        phone: phone.trim(),
        city: city.trim(),
      });
      await loadAddresses();
      setName("");
      setDetails("");
      setPhone("");
      setCity("");
      setShowForm(false);
      toast.success("Address added");
    } catch {
      toast.error("Could not add the address");
    }
  };

  const removeAddress = async (addressId: string) => {
    try {
      await api.delete(`/addresses/${addressId}`);
      await loadAddresses();
      toast.success("Address deleted");
    } catch {
      toast.error("Could not delete the address");
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Login required</h1>
        <Button className="mt-5" nativeButton={false} render={<Link href="/login" />}>Login</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Account</p><h1 className="mt-1 text-3xl font-bold">My Addresses</h1></div>
        <Button onClick={() => setShowForm((value) => !value)}><Plus className="size-4" /> Add address</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardContent className="grid gap-3 p-5 sm:grid-cols-2">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Address name (Home, Work)" className="h-10 rounded-lg border bg-background px-3 text-sm sm:col-span-2" />
            <textarea value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Address details" className="min-h-20 rounded-lg border bg-background p-3 text-sm sm:col-span-2" />
            <input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Phone number" className="h-10 rounded-lg border bg-background px-3 text-sm" />
            <input value={city} onChange={(event) => setCity(event.target.value)} placeholder="City" className="h-10 rounded-lg border bg-background px-3 text-sm" />
            <div className="flex gap-2 sm:col-span-2"><Button onClick={addAddress}>Save address</Button><Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button></div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}</div>
      ) : addresses.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address._id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><MapPin className="size-5" /></div><div><h2 className="font-bold">{address.name || "Saved address"}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{address.details}<br />{address.city} - {address.phone}</p></div></div>
                  <Button size="icon-sm" variant="ghost" className="text-destructive" aria-label="Delete address" onClick={() => removeAddress(address._id)}><Trash2 className="size-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border py-16 text-center"><MapPin className="mx-auto size-10 text-muted-foreground" /><h2 className="mt-3 font-bold">No saved addresses</h2><p className="mt-1 text-sm text-muted-foreground">Add an address for faster checkout.</p></div>
      )}
    </div>
  );
}
