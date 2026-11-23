"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { refreshCart, refreshWishlist } from "@/store/commerceStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type Category = { _id: string; name: string; image: string; slug: string };
type Brand = { _id: string; name: string; image: string; slug: string };
type Product = {
  _id: string;
  id?: string;
  title: string;
  imageCover: string;
  price: number;
  priceAfterDiscount?: number;
  sold: number;
  ratingsAverage: number;
  createdAt: string;
  category: Category;
  brand: Brand;
};

const fetchApi = async <T,>(path: string) => {
  const { data } = await api.get<{ data: T }>(path);
  return data.data;
};

const money = (value: number) => `${value.toLocaleString("en-US")} EGP`;

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [featuredTab, setFeaturedTab] = useState<"new" | "best">("new");
  const [favorites, setFavorites] = useState<string[]>([]);

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => fetchApi<Category[]>("/categories"),
  });
  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: () => fetchApi<Brand[]>("/brands"),
  });
  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchApi<Product[]>("/products"),
  });

  const categories = categoriesQuery.data ?? [];
  const brands = brandsQuery.data ?? [];
  const products = productsQuery.data ?? [];
  const heroProducts = [...products]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 3);

  useEffect(() => {
    if (heroProducts.length < 2) return;
    const timer = window.setInterval(
      () => setSlide((current) => (current + 1) % heroProducts.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [heroProducts.length]);

  const newest = [...products]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 8);
  const bestSelling = [...products]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 8);
  const featured = featuredTab === "new" ? newest : bestSelling;
  const activeHero = heroProducts[slide];

  const toggleFavorite = async (product: Product) => {
    const id = product._id;
    const isFavorite = favorites.includes(id);
    setFavorites((current) =>
      isFavorite ? current.filter((item) => item !== id) : [...current, id],
    );

    try {
      if (isFavorite) {
        await api.delete(`/wishlist/${id}`);
        await refreshWishlist();
        toast.success("Removed from wishlist");
      } else {
        await api.post("/wishlist", { productId: id });
        await refreshWishlist();
        toast.success("Added to wishlist");
      }
    } catch {
      setFavorites((current) =>
        isFavorite ? [...current, id] : current.filter((item) => item !== id),
      );
      toast.error("Please login to manage your wishlist");
    }
  };

  const addToCart = async (product: Product) => {
    try {
      await api.post("/cart", { productId: product._id });
      await refreshCart();
      toast.success(`${product.title} added to cart`);
    } catch {
      toast.error("Please login to add items to your cart");
    }
  };

  const sideCategories = categories.slice(0, 2);

  return (
    <div className="flex-1 bg-background">
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="relative min-h-[420px] overflow-hidden rounded-2xl bg-[#111827] text-white sm:min-h-[470px]">
              {activeHero ? (
                <>
                  <div className="absolute inset-0">
                    <img
                      src={activeHero.imageCover}
                      alt=""
                      className="h-full w-full object-cover object-center opacity-30"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-transparent" />
                  </div>
                  <div className="relative grid h-full min-h-[420px] items-center px-7 py-10 sm:min-h-[470px] sm:px-12 lg:grid-cols-[1fr_42%]">
                    <div className="z-10 max-w-xl space-y-5">
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">
                        {activeHero.category?.name || "Fresh arrivals"}
                      </p>
                      <h1 className="text-3xl font-black leading-tight sm:text-5xl">
                        {activeHero.title}
                      </h1>
                      <p className="max-w-md text-sm leading-6 text-white/75 sm:text-base">
                        Discover quality essentials selected for you, with fast delivery and secure checkout.
                      </p>
                      <div className="flex flex-wrap items-center gap-4">
                        <Button size="lg" nativeButton={false} className="bg-white text-slate-950 hover:bg-white/90" render={<Link href="/products" />}>
                          Shop now <ArrowRight className="size-4" />
                        </Button>
                        <span className="text-xl font-bold">{money(activeHero.price)}</span>
                      </div>
                    </div>
                    <div className="hidden h-full place-items-center lg:grid">
                      <div className="aspect-[4/5] w-[70%] rotate-3 rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur">
                        <img
                          src={activeHero.imageCover}
                          alt={activeHero.title}
                          className="h-full w-full rounded-[1.5rem] object-contain"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-5 left-7 flex gap-2 sm:left-12">
                    {heroProducts.map((product, index) => (
                      <button
                        key={product._id}
                        type="button"
                        aria-label={`Go to slide ${index + 1}`}
                        onClick={() => setSlide(index)}
                        className={`h-1.5 rounded-full transition-all ${index === slide ? "w-8 bg-white" : "w-3 bg-white/40"}`}
                      />
                    ))}
                  </div>
                  <div className="absolute bottom-5 right-5 flex gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="Previous slide"
                      className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                      onClick={() => setSlide((slide - 1 + heroProducts.length) % heroProducts.length)}
                    >
                      <ArrowLeft className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label="Next slide"
                      className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                      onClick={() => setSlide((slide + 1) % heroProducts.length)}
                    >
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="grid h-full min-h-[420px] place-items-center"><Skeleton className="h-full w-full bg-white/10" /></div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
              {sideCategories.map((category, index) => (
                <Link
                  key={category._id}
                  href={`/products?category=${category._id}`}
                  className={`group relative min-h-[180px] overflow-hidden rounded-2xl ${index === 0 ? "bg-rose-100" : "bg-sky-100"} lg:min-h-0`}
                >
                  <img src={category.image} alt={category.name} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5 text-white">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/75">Special offer</p>
                    <h2 className="mt-1 text-lg font-bold">{category.name}</h2>
                    <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold">Shop now <ArrowRight className="size-3.5" /></span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Explore</p>
              <h2 className="mt-1 text-2xl font-bold">Shop by Category</h2>
            </div>
            <Link href="/categories" className="hidden items-center gap-1 text-sm font-semibold hover:text-primary sm:flex">
              View all <ArrowRight className="size-4" />
            </Link>
          </div>
          {categoriesQuery.isLoading ? (
            <div className="grid grid-cols-5 gap-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/products?category=${category._id}`}
                  className="group min-w-[128px] rounded-xl border bg-card p-3 text-center transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="mx-auto aspect-square w-full max-w-24 overflow-hidden rounded-full bg-muted">
                    <img src={category.image} alt={category.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                  </div>
                  <p className="mt-3 truncate text-sm font-semibold">{category.name}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Top picks</p>
              <h2 className="mt-1 text-2xl font-bold">Featured Products</h2>
            </div>
            <div className="flex rounded-lg bg-muted p-1">
              <button type="button" onClick={() => setFeaturedTab("new")} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${featuredTab === "new" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Newest</button>
              <button type="button" onClick={() => setFeaturedTab("best")} className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${featuredTab === "best" ? "bg-background shadow-sm" : "text-muted-foreground"}`}>Best sellers</button>
            </div>
          </div>

          {productsQuery.isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[360px] rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((product) => {
                const favorite = favorites.includes(product._id);
                const discount = product.priceAfterDiscount && product.priceAfterDiscount < product.price
                  ? Math.round((1 - product.priceAfterDiscount / product.price) * 100)
                  : 0;
                return (
                  <Card key={product._id} className="group pt-0 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="relative aspect-[4/4.2] overflow-hidden rounded-t-xl bg-muted">
                      <img src={product.imageCover} alt={product.title} className="h-full w-full object-contain p-3 transition duration-500 group-hover:scale-105" />
                      {discount > 0 && (
                        <span className="absolute left-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-white">-{discount}%</span>
                      )}
                      <button
                        type="button"
                        aria-label={favorite ? "Remove from wishlist" : "Add to wishlist"}
                        onClick={() => toggleFavorite(product)}
                        className={`absolute right-3 top-3 grid size-9 place-items-center rounded-full border shadow-sm backdrop-blur transition ${favorite ? "border-rose-500 bg-rose-500 text-white" : "border-white/70 bg-white/90 text-slate-700 hover:text-rose-500"}`}
                      >
                        <Heart className={`size-4 ${favorite ? "fill-current" : ""}`} />
                      </button>
                    </div>
                    <CardContent className="flex flex-1 flex-col p-4">
                      <Link href={`/products?category=${product.category._id}`} className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline">
                        {product.category.name}
                      </Link>
                      <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold leading-5">{product.title}</h3>
                      <div className="mt-2 flex items-center gap-1 text-xs">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold">{product.ratingsAverage?.toFixed(1) || "0.0"}</span>
                        <span className="text-muted-foreground">({product.sold} sold)</span>
                      </div>
                      <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                        <div>
                          {discount > 0 && <p className="text-xs text-muted-foreground line-through">{money(product.price)}</p>}
                          <p className="font-bold text-primary">{money(product.priceAfterDiscount || product.price)}</p>
                        </div>
                        <Button size="icon-sm" aria-label={`Add ${product.title} to cart`} onClick={() => addToCart(product)}>
                          <ShoppingBag className="size-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/25 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Our partners</p>
            <h2 className="mt-1 text-2xl font-bold">Popular Brands</h2>
          </div>
          {brandsQuery.isLoading ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">{Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {brands.slice(0, 16).map((brand) => (
                <Link key={brand._id} href={`/products?brand=${brand._id}`} className="grid aspect-[4/3] place-items-center rounded-xl border bg-background p-3 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                  <img src={brand.image} alt={brand.name} className="h-full w-full object-contain" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-3 px-4 py-8 sm:px-6 md:grid-cols-3">
        {[
          { Icon: Truck, title: "Fast delivery", text: "Reliable delivery to your door" },
          { Icon: ShieldCheck, title: "Secure payment", text: "Protected and trusted checkout" },
          { Icon: RotateCcw, title: "Easy returns", text: "Simple and flexible returns" },
        ].map(({ Icon, title, text }) => (
          <Card key={title}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div>
              <div><h3 className="font-semibold">{title}</h3><p className="text-sm text-muted-foreground">{text}</p></div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
