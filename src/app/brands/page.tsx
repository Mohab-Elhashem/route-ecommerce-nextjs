"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Brand = { _id: string; name: string; image: string };

export default function BrandsPage() {
  const query = useQuery({
    queryKey: ["brands"],
    queryFn: async () => (await api.get<{ data: Brand[] }>("/brands")).data.data,
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Discover</p>
      <h1 className="mt-1 text-3xl font-bold">Brands</h1>
      {query.isLoading ? <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{Array.from({ length: 18 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-xl" />)}</div> : (
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {query.data?.map((brand) => (
            <Link key={brand._id} href={`/brands/${brand._id}`}>
              <Card className="grid aspect-[4/3] place-items-center p-4 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <Image src={brand.image} alt={brand.name} width={220} height={165} className="h-full w-full object-contain" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
