"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Category = { _id: string; name: string; image: string; slug: string };

export default function CategoriesPage() {
  const query = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get<{ data: Category[] }>("/categories");
      return data.data;
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Explore</p>
      <h1 className="mt-1 text-3xl font-bold">Categories</h1>
      {query.isLoading ? (
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>
      ) : (
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {query.data?.map((category) => (
            <Link key={category._id} href={`/categories/${category._id}`}>
              <Card className="h-full pt-0 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg">
                <div className="aspect-square overflow-hidden rounded-t-xl bg-muted"><img src={category.image} alt={category.name} className="h-full w-full object-cover transition duration-300 hover:scale-105" /></div>
                <CardContent className="p-4 text-center"><h2 className="font-bold">{category.name}</h2></CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
