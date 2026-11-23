"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Heart, Minus, Plus, ShoppingBag, Star } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { api } from "@/lib/api";
import { refreshCart, refreshWishlist } from "@/store/commerceStore";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { money, Product } from "@/components/product-card";

type Review = {
  _id: string;
  review?: string;
  title?: string;
  description?: string;
  ratings: number;
  product?: string;
  user?: { _id?: string; name?: string };
};

export default function ProductDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [editing, setEditing] = useState<string | null>(null);
  const { token, user } = useAppSelector((state) => state.auth);

  const productQuery = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await api.get<{ data: Product }>(`/products/${id}`);
      return data.data;
    },
  });
  const reviewsQuery = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      try {
        const { data } = await api.get<{ data: Review[] }>(`/reviews`, { params: { product: id } });
        return data.data;
      } catch {
        return [] as Review[];
      }
    },
  });

  const product = productQuery.data;
  const discounted = product?.priceAfterDiscount && product.priceAfterDiscount < product.price;
  const finalPrice = discounted ? product?.priceAfterDiscount : product?.price;
  const images = product ? [product.imageCover, ...(product.images || [])].filter((value, index, array) => value && array.indexOf(value) === index) : [];

  const addToCart = async () => {
    try {
      await api.post("/cart", { productId: id, count: quantity });
      await refreshCart();
      toast.success("Added to cart");
    } catch {
      toast.error("Please login to add items to your cart");
    }
  };

  const toggleFavorite = async () => {
    try {
      await api.post("/wishlist", { productId: id });
      await refreshWishlist();
      toast.success("Added to wishlist");
    } catch {
      toast.error("Please login to manage your wishlist");
    }
  };

  const saveReview = async () => {
    if (!token) {
      toast.error("Please login to add a review");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Write a review first");
      return;
    }
    try {
      const payload = { title: reviewText, review: reviewText, ratings: rating, product: id };
      if (editing) await api.put(`/reviews/${editing}`, payload);
      else await api.post("/reviews", payload);
      setReviewText("");
      setEditing(null);
      setRating(5);
      await reviewsQuery.refetch();
      toast.success(editing ? "Review updated" : "Review added");
    } catch {
      toast.error("Could not save the review");
    }
  };



  if (productQuery.isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <Skeleton className="aspect-square rounded-2xl" />
        <div className="space-y-4"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-5 w-1/3" /><Skeleton className="h-32 w-full" /><Skeleton className="h-12 w-full" /></div>
      </div>
    );
  }
  if (!product) {
    return <div className="mx-auto max-w-7xl px-4 py-20 text-center"><h1 className="text-2xl font-bold">Product not found</h1></div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link> / <Link href="/products" className="hover:text-foreground">Products</Link> / <span>{product.title}</span>
      </nav>
      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl border bg-muted">
            <img src={images[selectedImage] || product.imageCover} alt={product.title} className="h-full w-full object-contain p-4" />
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto">
            {images.map((image, index) => (
              <button key={image} type="button" onClick={() => setSelectedImage(index)} className={`size-20 shrink-0 overflow-hidden rounded-lg border-2 bg-muted p-1 ${selectedImage === index ? "border-primary" : "border-transparent"}`}>
                <img src={image} alt="" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <Link href={`/brands/${product.brand?._id}`} className="text-sm font-bold uppercase tracking-wider text-primary">{product.brand?.name}</Link>
          <h1 className="mt-2 text-3xl font-bold leading-tight">{product.title}</h1>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className={`size-4 ${index < Math.round(product.ratingsAverage || 0) ? "fill-amber-400 text-amber-400" : "text-muted"}`} />)}</div>
            <span className="text-sm text-muted-foreground">{product.ratingsAverage?.toFixed(1)} ({product.ratingsQuantity || 0} reviews)</span>
          </div>
          <div className="mt-5 flex items-baseline gap-3">
            {discounted && <span className="text-lg text-muted-foreground line-through">{money(product.price)}</span>}
            <span className="text-3xl font-black text-primary">{money(finalPrice || product.price)}</span>
          </div>
          <p className="mt-6 leading-7 text-muted-foreground">{product.description}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl border p-4 text-sm">
            <div><span className="text-muted-foreground">Category</span><p className="mt-1 font-semibold"><Link href={`/categories/${product.category._id}`} className="hover:text-primary">{product.category.name}</Link></p></div>
            <div><span className="text-muted-foreground">Availability</span><p className="mt-1 font-semibold">{product.quantity > 0 ? `${product.quantity} in stock` : "Out of stock"}</p></div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex h-11 items-center rounded-lg border">
              <Button size="icon" variant="ghost" disabled={quantity <= 1} onClick={() => setQuantity((value) => value - 1)}><Minus className="size-4" /></Button>
              <span className="w-10 text-center text-sm font-bold">{quantity}</span>
              <Button size="icon" variant="ghost" disabled={quantity >= product.quantity} onClick={() => setQuantity((value) => value + 1)}><Plus className="size-4" /></Button>
            </div>
            <Button size="lg" className="flex-1" disabled={product.quantity <= 0} onClick={addToCart}><ShoppingBag className="size-4" /> Add to cart</Button>
            <Button size="icon-lg" variant="outline" aria-label="Add to wishlist" onClick={toggleFavorite}><Heart className="size-5" /></Button>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="mb-5 text-2xl font-bold">Reviews</h2>
        <Card className="mb-5">
          <CardContent className="p-5">
            {token ? (
              <div className="space-y-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <button key={index} type="button" aria-label={`${index + 1} stars`} onClick={() => setRating(index + 1)}>
                      <Star className={`size-5 ${index < rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                    </button>
                  ))}
                </div>
                <textarea value={reviewText} onChange={(event) => setReviewText(event.target.value)} placeholder="Share your experience..." className="min-h-24 w-full rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                <div className="flex gap-2">
                  <Button onClick={saveReview}>{editing ? "Update review" : "Add review"}</Button>
                  {editing && <Button variant="outline" onClick={() => { setEditing(null); setReviewText(""); }}>Cancel</Button>}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground"><Link href="/login" className="font-semibold text-primary underline">Login</Link> to add or manage a review.</p>
            )}
          </CardContent>
        </Card>
        {reviewsQuery.isLoading ? <Skeleton className="h-28 w-full" /> : reviewsQuery.data?.length ? (
          <div className="grid gap-3">
            {reviewsQuery.data.map((review) => (
              <Card key={review._id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{review.user?.name || user?.name || "Customer"}</p>
                      <div className="mt-1 flex">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className={`size-3.5 ${index < review.ratings ? "fill-amber-400 text-amber-400" : "text-muted"}`} />)}</div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{review.review || review.title || review.description}</p>
                    </div>
                    
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border py-10 text-center text-sm text-muted-foreground">No reviews yet.</p>
        )}
      </section>
    </div>
  );
}
