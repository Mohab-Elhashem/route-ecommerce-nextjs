"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Product, ProductCard } from "@/components/product-card";

type Category = { _id: string; name: string; image: string };
type SubCategory = { _id: string; name: string; category: string };

export default function CategoryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const categoryQuery = useQuery({
    queryKey: ["category", id],
    queryFn: async () => (await api.get<{ data: Category }>(`/categories/${id}`)).data.data,
  });
  const subcategoriesQuery = useQuery({
    queryKey: ["category-subcategories", id],
    queryFn: async () => (await api.get<{ data: SubCategory[] }>(`/categories/${id}/subcategories`)).data.data,
  });
  const productsQuery = useQuery({
    queryKey: ["category-products", id],
    queryFn: async () => (await api.get<{ data: Product[] }>("/products", { params: { "category[in]": id, limit: 40 } })).data.data,
  });

  if (categoryQuery.isLoading) return <div className="mx-auto max-w-7xl px-4 py-10"><Skeleton className="h-80 w-full" /></div>;
  const category = categoryQuery.data;
  if (!category) return <div className="py-20 text-center">Category not found</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="relative min-h-72 overflow-hidden rounded-2xl bg-slate-950 text-white">
        <Image src={category.image} alt="" fill sizes="100vw" className="object-cover opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 to-transparent" />
        <div className="relative flex min-h-72 items-center p-8"><div><p className="text-sm font-bold uppercase tracking-widest text-amber-300">Category</p><h1 className="mt-2 text-4xl font-black">{category.name}</h1></div></div>
      </div>

      <section className="mt-10">
        <h2 className="mb-5 text-2xl font-bold">Subcategories</h2>
        {subcategoriesQuery.isLoading ? <div className="flex gap-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-36" />)}</div> : (
          <div className="flex flex-wrap gap-3">
            {subcategoriesQuery.data?.map((subcategory) => (
              <Link key={subcategory._id} href={`/products?category=${id}&subcategory=${subcategory._id}`} className="rounded-full border bg-card px-5 py-2.5 text-sm font-semibold transition hover:border-primary hover:text-primary">
                {subcategory.name}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-5 text-2xl font-bold">Products</h2>
        {productsQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[360px] rounded-xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {productsQuery.data?.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </section>
    </div>
  );
}
