"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api, getApiErrorMessage } from "@/lib/api";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const emailSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});
const codeSchema = z.object({
  resetCode: z.string().trim().regex(/^[0-9]{4,8}$/, "Enter the reset code from your email"),
});
const passwordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  rePassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((values) => values.newPassword === values.rePassword, {
  path: ["rePassword"],
  message: "Passwords do not match",
});

type EmailValues = z.infer<typeof emailSchema>;
type CodeValues = z.infer<typeof codeSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");

  const emailForm = useForm<EmailValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });
  const codeForm = useForm<CodeValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { resetCode: "" },
  });
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", rePassword: "" },
  });

  const sendCode = async (values: EmailValues) => {
    try {
      await api.post("/auth/forgotPasswords", values);
      setEmail(values.email);
      setStep(2);
      toast.success("Reset code sent to your email");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to send reset code"));
    }
  };

  const verifyCode = async (values: CodeValues) => {
    try {
      await api.post("/auth/verifyResetCode", values);
      setStep(3);
      toast.success("Reset code verified");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Invalid reset code"));
    }
  };

  const resetPassword = async (values: PasswordValues) => {
    try {
      await api.put("/auth/resetPassword", {
        email,
        newPassword: values.newPassword,
      });
      toast.success("Password reset successfully");
      router.push("/login");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to reset password"));
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      description={
        step === 1
          ? "Enter your email to receive a reset code"
          : step === 2
            ? "Enter the code sent to your email"
            : "Choose a new password"
      }
    >
      <div className="mb-6 flex justify-center gap-2">
        {[1, 2, 3].map((item) => (
          <Badge key={item} variant={item === step ? "default" : "secondary"}>
            {item}
          </Badge>
        ))}
      </div>

      {step === 1 && (
        <form onSubmit={emailForm.handleSubmit(sendCode)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...emailForm.register("email")} />
            {emailForm.formState.errors.email && (
              <p className="text-sm text-destructive">{emailForm.formState.errors.email.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
            {emailForm.formState.isSubmitting ? "Sending..." : "Send reset code"}
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={codeForm.handleSubmit(verifyCode)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resetCode">Reset code</Label>
            <Input id="resetCode" inputMode="numeric" placeholder="000000" {...codeForm.register("resetCode")} />
            {codeForm.formState.errors.resetCode && (
              <p className="text-sm text-destructive">{codeForm.formState.errors.resetCode.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={codeForm.formState.isSubmitting}>
            {codeForm.formState.isSubmitting ? "Verifying..." : "Verify code"}
          </Button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={passwordForm.handleSubmit(resetPassword)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" type="password" placeholder="••••••••" {...passwordForm.register("newPassword")} />
            {passwordForm.formState.errors.newPassword && (
              <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="rePassword">Confirm password</Label>
            <Input id="rePassword" type="password" placeholder="••••••••" {...passwordForm.register("rePassword")} />
            {passwordForm.formState.errors.rePassword && (
              <p className="text-sm text-destructive">{passwordForm.formState.errors.rePassword.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={passwordForm.formState.isSubmitting}>
            {passwordForm.formState.isSubmitting ? "Resetting..." : "Reset password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
