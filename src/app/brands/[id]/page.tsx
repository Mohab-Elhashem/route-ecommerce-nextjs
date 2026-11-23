"use client";

import Image from "next/image";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Product, ProductCard } from "@/components/product-card";

type Brand = { _id: string; name: string; image: string };

export default function BrandDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const brandQuery = useQuery({
    queryKey: ["brand", id],
    queryFn: async () => (await api.get<{ data: Brand }>(`/brands/${id}`)).data.data,
  });
  const productsQuery = useQuery({
    queryKey: ["brand-products", id],
    queryFn: async () => (await api.get<{ data: Product[] }>("/products", { params: { brand: id, limit: 40 } })).data.data,
  });

  if (brandQuery.isLoading) return <div className="mx-auto max-w-7xl px-4 py-10"><Skeleton className="h-80 w-full" /></div>;
  const brand = brandQuery.data;
  if (!brand) return <div className="py-20 text-center">Brand not found</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid min-h-64 place-items-center rounded-2xl border bg-gradient-to-br from-muted/30 to-background p-8">
        <div className="text-center"><Image src={brand.image} alt={brand.name} width={256} height={112} className="mx-auto h-28 max-w-64 object-contain" /><p className="mt-4 text-xs font-bold uppercase tracking-widest text-primary">Brand</p><h1 className="mt-1 text-3xl font-black">{brand.name}</h1></div>
      </div>
      <section className="mt-10">
        <h2 className="mb-5 text-2xl font-bold">Products</h2>
        {productsQuery.isLoading ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[360px] rounded-xl" />)}</div> : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{productsQuery.data?.map((product) => <ProductCard key={product._id} product={product} />)}</div>
        )}
      </section>
    </div>
  );
}
