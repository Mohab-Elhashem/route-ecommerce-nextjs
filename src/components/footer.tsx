import Link from "next/link";
import { Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">R</span>
            <span>Route<span className="text-primary">Shop</span></span>
          </Link>
          <p className="text-sm leading-6 text-muted-foreground">
            Discover quality products and enjoy a simple, secure shopping experience.
          </p>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">Shop</h3>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <Link href="/products" className="hover:text-foreground">Products</Link>
            <Link href="/categories" className="hover:text-foreground">Categories</Link>
            <Link href="/brands" className="hover:text-foreground">Brands</Link>
            <Link href="/wishlist" className="hover:text-foreground">Wishlist</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">Account</h3>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <Link href="/profile" className="hover:text-foreground">Profile</Link>
            <Link href="/allorders" className="hover:text-foreground">Orders</Link>
            <Link href="/change-password" className="hover:text-foreground">Change Password</Link>
          </div>
        </div>
        <div>
          <h3 className="mb-4 font-semibold">Contact</h3>
          <div className="grid gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><MapPin className="size-4" /> Cairo, Egypt</span>
            <span className="flex items-center gap-2"><Phone className="size-4" /> +20 100 000 0000</span>
            <span className="flex items-center gap-2"><Mail className="size-4" /> support@routeshop.com</span>
          </div>
          <div className="mt-4 flex gap-2">
            <Link href="#" aria-label="Website" className="grid size-9 place-items-center rounded-full border hover:bg-accent"><Globe className="size-4" /></Link>
            <Link href="#" aria-label="Social" className="grid size-9 place-items-center rounded-full border hover:bg-accent"><MessageCircle className="size-4" /></Link>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-sm text-muted-foreground sm:px-6">
          © 2026 RouteShop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
