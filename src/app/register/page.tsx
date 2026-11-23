"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const registerSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters").max(50),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rePassword: z.string(),
  phone: z.string().regex(/^01[0125][0-9]{8}$/, "Enter a valid Egyptian phone number"),
}).refine((values) => values.password === values.rePassword, {
  path: ["rePassword"],
  message: "Passwords do not match",
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", rePassword: "", phone: "" },
  });

  const onSubmit = async (values: RegisterValues) => {
    try {
      const { data } = await api.post("/auth/signup", values);
      const token = data.token as string;
      const user = data.user ?? { name: values.name, email: values.email };
      window.localStorage.setItem("token", token);
      window.localStorage.setItem("user", JSON.stringify(user));
      dispatch(setCredentials({ token, user }));
      toast.success("Account created successfully");
      router.push("/");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to create account"));
    }
  };

  return (
    <AuthShell
      title="Create account"
      description="Join RouteShop and start shopping"
      footer={
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">Login</Link>
        </p>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {([
          ["name", "Full name", "text", "Ahmed Abd Al-Muti"],
          ["email", "Email", "email", "you@example.com"],
          ["phone", "Phone", "tel", "01010700701"],
          ["password", "Password", "password", "••••••••"],
          ["rePassword", "Confirm password", "password", "••••••••"],
        ] as const).map(([field, label, type, placeholder]) => (
          <div className="space-y-2" key={field}>
            <Label htmlFor={field}>{label}</Label>
            <Input id={field} type={type} placeholder={placeholder} {...form.register(field)} />
            {form.formState.errors[field] && (
              <p className="text-sm text-destructive">{form.formState.errors[field]?.message}</p>
            )}
          </div>
        ))}
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating account..." : "Register"}
        </Button>
      </form>
    </AuthShell>
  );
}
