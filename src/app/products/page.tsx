"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Product, ProductCard } from "@/components/product-card";

type Meta = { currentPage: number; numberOfPages: number; limit: number };
type Category = { _id: string; name: string };
type SubCategory = { _id: string; name: string; category: string };
type Brand = { _id: string; name: string };

async function getList<T>(path: string) {
  const { data } = await api.get<{ data: T }>(path);
  return data.data;
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [subCategory, setSubCategory] = useState(searchParams.get("subcategory") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const categories = useQuery({ queryKey: ["categories"], queryFn: () => getList<Category[]>("/categories") });
  const subCategories = useQuery({ queryKey: ["subcategories"], queryFn: () => getList<SubCategory[]>("/subcategories") });
  const brands = useQuery({ queryKey: ["brands"], queryFn: () => getList<Brand[]>("/brands") });

  useEffect(() => {
    const timer = window.setTimeout(() => setPage(1), 400);
    return () => window.clearTimeout(timer);
  }, [keyword]);

  const productsQuery = useQuery({
    queryKey: ["products", page, keyword, category, subCategory, brand, minPrice, maxPrice],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit: 12 };
      if (keyword) params.keyword = keyword;
      if (category) params["category[in]"] = category;
      if (subCategory) params["subcategory[in]"] = subCategory;
      if (brand) params["brand"] = brand;
      if (minPrice) params["price[gte]"] = minPrice;
      if (maxPrice) params["price[lte]"] = maxPrice;
      const { data } = await api.get<{ data: Product[]; metadata: Meta; results: number }>("/products", { params });
      return data;
    },
  });

  const clearFilters = () => {
    setKeyword("");
    setCategory("");
    setSubCategory("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  const visibleSubcategories = subCategories.data?.filter((item) =>
    category ? item.category === category : true,
  );
  const metadata = productsQuery.data?.metadata;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Shop</p>
        <h1 className="mt-1 text-3xl font-bold">All Products</h1>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-xl border bg-card p-4 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-semibold">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Search products..." className="pl-9" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex">
          <div>
            <label className="mb-1.5 block text-xs font-semibold">Category</label>
            <select value={category} onChange={(event) => { setCategory(event.target.value); setSubCategory(""); setPage(1); }} className="h-9 min-w-36 rounded-lg border bg-background px-3 text-sm">
              <option value="">All categories</option>
              {categories.data?.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">Subcategory</label>
            <select value={subCategory} onChange={(event) => { setSubCategory(event.target.value); setPage(1); }} className="h-9 min-w-36 rounded-lg border bg-background px-3 text-sm">
              <option value="">All subcategories</option>
              {visibleSubcategories?.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">Brand</label>
            <select value={brand} onChange={(event) => { setBrand(event.target.value); setPage(1); }} className="h-9 min-w-36 rounded-lg border bg-background px-3 text-sm">
              <option value="">All brands</option>
              {brands.data?.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">Min price</label>
            <Input type="number" value={minPrice} onChange={(event) => { setMinPrice(event.target.value); setPage(1); }} placeholder="0" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold">Max price</label>
            <Input type="number" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); setPage(1); }} placeholder="10000" />
          </div>
        </div>
        <Button variant="outline" onClick={clearFilters}><X className="size-4" /> Clear</Button>
      </div>

      {productsQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, index) => <Skeleton key={index} className="h-[360px] rounded-xl" />)}
        </div>
      ) : productsQuery.data?.data.length ? (
        <>
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal className="size-4" />
            {productsQuery.data.results} products
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {productsQuery.data.data.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
          {metadata && metadata.numberOfPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button>
              {Array.from({ length: metadata.numberOfPages }, (_, index) => index + 1).slice(Math.max(0, page - 3), Math.max(5, page + 2)).map((number) => (
                <Button key={number} variant={number === page ? "default" : "outline"} onClick={() => setPage(number)}>{number}</Button>
              ))}
              <Button variant="outline" disabled={page >= metadata.numberOfPages} onClick={() => setPage((value) => value + 1)}>Next</Button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border py-16 text-center">
          <h2 className="font-semibold">No products found</h2>
          <p className="mt-1 text-sm text-muted-foreground">Try changing or clearing your filters.</p>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><Skeleton className="h-[700px]" /></div>}><ProductsContent /></Suspense>;
}
