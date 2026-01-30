"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/axios";
import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PasswordAuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="absolute top-8 left-8">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            ← Back
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-md">
        <Card className="p-8 border-border">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {isLogin ? "Sign In" : "Create Account"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? "Enter your credentials to access your account"
                : "Set up a new account with a secure password"}
            </p>
          </div>

          {isLogin ? <LoginForm /> : <RegisterForm />}

          <Button
            type="button"
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => {
              setIsLogin((prev) => !prev);
            }}
          >
            {isLogin ? "Create New Account" : "Back to Sign In"}
          </Button>
        </Card>
      </div>
    </main>
  );
}

function LoginForm() {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async (data) => {
      try {
        console.log(data.value);
        const response = await api.post("/auth/password/login", {
          email: data.value.email,
          password: data.value.password,
        });
        if (response.status === 200) {
          router.push("/dashboard");
          localStorage.setItem("access_token", response.data.token);
        } else {
          console.error(response);
        }
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="email"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Email Address</Label>
            <Input
              id={field.name}
              name={field.name}
              type="email"
              placeholder="you@example.com"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              required
              disabled={field.form.state.isSubmitting}
              className="bg-card"
            />
          </div>
        )}
      />

      <form.Field
        name="password"
        children={(field) => (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={field.name}>Password</Label>
              <Link href="#" className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id={field.name}
              name={field.name}
              type="password"
              placeholder="••••••••"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              required
              disabled={field.form.state.isSubmitting}
              className="bg-card"
            />
          </div>
        )}
      />

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            className="w-full"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        )}
      />
    </form>
  );
}

function RegisterForm() {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async (data) => {
      try {
        const response = await api.post("/auth/password/register", {
          email: data.value.email,
          password: data.value.password,
        });
        if (response.status === 201) {
          router.push("/dashboard");
          localStorage.setItem("access_token", response.data.token);
        } else {
          console.error(response);
        }
      } catch (error) {
        console.error(error);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <form.Field
        name="email"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Email Address</Label>
            <Input
              id={field.name}
              name={field.name}
              type="email"
              placeholder="you@example.com"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              required
              disabled={field.form.state.isSubmitting}
              className="bg-card"
            />
          </div>
        )}
      />

      <form.Field
        name="password"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Password</Label>
            <Input
              id={field.name}
              name={field.name}
              type="password"
              placeholder="••••••••"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              required
              disabled={field.form.state.isSubmitting}
              className="bg-card"
            />
            <p className="text-xs text-muted-foreground">
              Password must be at least 8 characters long
            </p>
          </div>
        )}
      />

      <form.Field
        name="confirmPassword"
        children={(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>Confirm Password</Label>
            <Input
              id={field.name}
              name={field.name}
              type="password"
              placeholder="••••••••"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              required
              disabled={field.form.state.isSubmitting}
              className="bg-card"
            />
          </div>
        )}
      />

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            className="w-full"
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        )}
      />
    </form>
  );
}
