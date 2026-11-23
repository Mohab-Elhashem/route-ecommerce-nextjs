"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api, getApiErrorMessage } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Current password is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rePassword: z.string().min(6, "Please confirm your new password"),
}).refine((values) => values.password === values.rePassword, {
  path: ["rePassword"],
  message: "Passwords do not match",
});

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", password: "", rePassword: "" },
  });

  const onSubmit = async (values: ChangePasswordValues) => {
    if (!token) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }
    try {
      await api.put("/users/changeMyPassword", values);
      toast.success("Password changed successfully");
      form.reset();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to change password"));
    }
  };

  return (
    <AuthShell title="Change password" description="Update the password for your account">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {([
          ["currentPassword", "Current password"],
          ["password", "New password"],
          ["rePassword", "Confirm new password"],
        ] as const).map(([field, label]) => (
          <div className="space-y-2" key={field}>
            <Label htmlFor={field}>{label}</Label>
            <Input id={field} type="password" placeholder="••••••••" {...form.register(field)} />
            {form.formState.errors[field] && (
              <p className="text-sm text-destructive">{form.formState.errors[field]?.message}</p>
            )}
          </div>
        ))}
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Updating..." : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
