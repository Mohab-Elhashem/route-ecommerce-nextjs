"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";
import { Heart, LogIn, Menu, ShoppingCart, UserRound } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CartDrawer } from "@/components/cart-drawer";
import {
  clearCommerceCounts,
  getCommerceSnapshot,
  refreshCart,
  refreshWishlist,
  subscribeCommerce,
} from "@/store/commerceStore";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Brands", href: "/brands" },
];

export function Navbar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, user } = useAppSelector((state) => state.auth);
  const commerce = useSyncExternalStore(
    subscribeCommerce,
    getCommerceSnapshot,
    getCommerceSnapshot,
  );

  useEffect(() => {
    if (token) {
      void refreshCart();
      void refreshWishlist();
    } else {
      void clearCommerceCounts();
    }
  }, [token]);

  const handleLogout = () => {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");
    dispatch(logout());
    void clearCommerceCounts();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            R
          </span>
          <span>Route<span className="text-primary">Shop</span></span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Wishlist"
            nativeButton={false}
            render={<Link href="/wishlist" className="relative" />}
          >
              <Heart className="size-5" />
              <Badge className="absolute -right-1 -top-1 size-5 justify-center rounded-full p-0 text-[10px]">
                {commerce.wishlistCount}
              </Badge>
          </Button>
          <CartDrawer>
            <ShoppingCart className="size-5" />
            <Badge className="absolute -right-1 -top-1 size-5 justify-center rounded-full p-0 text-[10px]">
              {commerce.cartCount}
            </Badge>
          </CartDrawer>

          {token ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" aria-label="Account" />
                }
              >
                <UserRound className="size-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <p className="truncate text-sm">{user?.name || "My account"}</p>
                    {typeof user?.email === "string" && (
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    )}
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/profile" className="flex w-full">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/change-password" className="flex w-full">Change Password</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/addresses" className="flex w-full">Addresses</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/allorders" className="flex w-full">Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/login" />}
              className="hidden sm:flex"
            >
              <LogIn className="size-4" /> Login
            </Button>
          )}

          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu" />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
              <SheetHeader className="border-b">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col p-4">
                {navigation.map((item) => (
                  <Link key={item.href} href={item.href} className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-accent">
                    {item.label}
                  </Link>
                ))}
                {!token && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant="outline" nativeButton={false} render={<Link href="/login" />}>Login</Button>
                    <Button nativeButton={false} render={<Link href="/register" />}>Register</Button>
                  </div>
                )}
                {token && (
                  <div className="mt-4 border-t pt-3">
                    <Link href="/addresses" className="block rounded-lg px-3 py-3 text-sm font-medium hover:bg-accent">Addresses</Link>
                    <Link href="/allorders" className="block rounded-lg px-3 py-3 text-sm font-medium hover:bg-accent">My Orders</Link>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
