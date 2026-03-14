"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (!result?.ok) {
      setSubmitError("Invalid email or password");
      return;
    }

    const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
    const sessionJson = (await sessionRes.json().catch(() => ({}))) as { user?: { role?: string } };
    const role = sessionJson.user?.role;

    if (role === "PROVIDER") router.push("/provider/dashboard");
    else if (role === "EMPLOYER_ADMIN") router.push("/employer/dashboard");
    else router.push("/patient/dashboard");
    router.refresh();
  });

  return (
    <main className="min-h-screen bg-[linear-gradient(160deg,#fff8fa_0%,#f2fdfa_52%,#ecfbfb_100%)] px-4 py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-300 to-teal-400 text-xl font-bold text-white">
            M
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Maven Health
            </h1>
            <p className="text-sm text-muted-foreground">
              Secure care, designed around your health.
            </p>
          </div>
        </div>

        <Card className="border-0 bg-white/85 shadow-xl ring-1 ring-rose-100 backdrop-blur">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Access your care dashboard and upcoming appointments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                />
                {errors.email ? (
                  <p className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                />
                {errors.password ? (
                  <p className="text-xs text-destructive">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <Button
                className="h-10 w-full bg-teal-600 text-white hover:bg-teal-500"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
              {submitError ? <p className="text-xs text-destructive">{submitError}</p> : null}
            </form>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                className="font-medium text-teal-700 underline-offset-4 hover:underline"
                href="/register"
              >
                Register
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
