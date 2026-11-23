"use client";

import { useEffect, useState } from "react";
import { Provider as ReduxProvider, useDispatch } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { makeStore } from "@/store/store";
import { hydrateAuth, logout } from "@/store/authSlice";
import type { AppDispatch, AppStore } from "@/store/store";

function AuthHydration() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    try {
      const token = window.localStorage.getItem("token");
      const rawUser = window.localStorage.getItem("user");
      dispatch(
        hydrateAuth({
          token,
          user: rawUser ? JSON.parse(rawUser) : null,
          hydrated: true,
        }),
      );
    } catch {
      dispatch(hydrateAuth({ token: null, user: null, hydrated: true }));
    }
  }, [dispatch]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "token") {
        if (!event.newValue) dispatch(logout());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [dispatch]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, refetchOnWindowFocus: false },
        },
      }),
  );
  const [store] = useState<AppStore>(() => makeStore());

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthHydration />
        {children}
        <Toaster richColors position="top-center" />
      </QueryClientProvider>
    </ReduxProvider>
  );
}
