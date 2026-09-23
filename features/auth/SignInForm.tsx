"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, LockKeyhole, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { persistAuthToken, signIn } from "@/services/auth-service";
import { getApiErrorDetails } from "@/services/api-error";
import { useToast } from "@/hooks/use-toast";
import { isCompanyAdmin, isCompanyApproved, useAuthStore } from "@/store/auth-store";
import { ThemeToggle } from "@/features/theme/ThemeToggle";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().default(false),
});

type LoginValues = z.infer<typeof loginSchema>;

export function SignInForm() {
  const router = useRouter();
  const {
    hasHydrated,
    loading,
    logout,
    setLoading,
    setUser,
    setError,
    token,
    user,
  } = useAuthStore();
  const { toast } = useToast();
  const isAuthenticated = Boolean(user && token && isCompanyAdmin(user) && isCompanyApproved(user));

  useEffect(() => {
    if (hasHydrated && isAuthenticated && token) {
      persistAuthToken(token);
      router.replace("/dashboard");
    }
  }, [hasHydrated, isAuthenticated, router, token]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (values: LoginValues) => {
    try {
      setLoading(true);
      setError(null);

      console.info("[Auth][Login] Login started", {
        email: values.email.trim(),
      });

      const response = await signIn(values);

      if (!isCompanyAdmin(response.user)) {
        logout();
        throw new Error("Only company admin accounts can access this dashboard.");
      }

      if (!isCompanyApproved(response.user)) {
        setUser(response.user, null);
        router.replace("/company-onboarding/verification-status");
        return;
      }

      if (!response.token) {
        throw new Error("Authentication succeeded but no session token was returned.");
      }

      setUser(response.user, response.token);
      persistAuthToken(response.token);
      console.info("[Auth][Login] Currently logged in user data", response.user);

      toast({
        type: "success",
        message: response.message ?? "Signed in successfully.",
      });

      console.info("[Auth][Login] Login successful", {
        email: response.user.email,
        role: response.user.role,
      });

      router.replace("/dashboard");
    } catch (error) {
      const details = getApiErrorDetails(
        error,
        "Unable to sign in.",
      );

      const message = `${details.message} (${details.reason.replaceAll(
        "_",
        " ",
      )})`;

      console.error("[Auth][Login] Login failed", details);

      setError(message);

      toast({
        type: "error",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!hasHydrated || isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f6f8] text-brand-dark dark:bg-[#121419] dark:text-white">
        <span className="size-5 animate-spin rounded-full border-2 border-brand-red/25 border-t-brand-red" />
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f6f8] px-5 py-5 dark:bg-[#121419]">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#eef1f5_0%,#fff1f3_34%,#ffffff_51%,#f7e8ec_68%,#e9edf3_100%)] dark:bg-[linear-gradient(145deg,#2a1016_0%,#17191f_38%,#121419_62%,#251016_100%)]" />

      {/* Theme Toggle */}
      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle />
      </div>

      <section className="relative z-10 flex min-h-[540px] w-full max-w-[450px] flex-col items-center rounded-[3px] bg-white/95 px-[56px] pb-10 pt-11 shadow-[0_30px_90px_rgba(23,25,31,0.13)] backdrop-blur-sm dark:bg-[#1b1d22]/95">
        <div className="mb-4 flex items-center gap-3 text-brand-red">
          <span className="size-7 rounded-full bg-[#d90b32]" />
          <span className="text-[18px] font-extrabold">Sherix</span>
        </div>

        <h1 className="mb-9 text-center text-[24px] font-extrabold tracking-[-0.02em] text-brand-dark dark:text-white">
          Welcome Back!
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <label className="mb-5 block">
            <span className="mb-2 block text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#6f7784] dark:text-white/60">
              Email Address
            </span>

            <span className="relative block">
              <Mail className="absolute left-3.5 top-1/2 size-[13px] -translate-y-1/2 text-[#7c8491]" />

              <input
                className="h-[36px] w-full rounded-[12px] border border-[#d8dde5] bg-[#fbfcfd] pl-9 pr-3.5 text-[11px] font-medium text-brand-dark outline-none placeholder:text-[#9aa2ae] focus:border-[#d90b32] focus:ring-4 focus:ring-[#fde8ed] dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-red-950/30"
                placeholder="e.g. alex@sherix.com"
                {...register("email")}
              />
            </span>

            {errors.email ? (
              <span className="auth-error">{errors.email.message}</span>
            ) : null}
          </label>

          <label className="mb-5 block">
            <span className="mb-2 block text-[9px] font-extrabold uppercase tracking-[0.08em] text-[#6f7784] dark:text-white/60">
              Password
            </span>

            <span className="relative block">
              <LockKeyhole className="absolute left-3.5 top-1/2 size-[13px] -translate-y-1/2 text-[#7c8491]" />

              <input
                className="h-[36px] w-full rounded-[12px] border border-[#d8dde5] bg-[#fbfcfd] pl-9 pr-9 text-[11px] font-medium text-brand-dark outline-none placeholder:text-[#9aa2ae] focus:border-[#d90b32] focus:ring-4 focus:ring-[#fde8ed] dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-red-950/30"
                placeholder="Enter your password"
                type="password"
                {...register("password")}
              />

              <Eye className="absolute right-3.5 top-1/2 size-[12px] -translate-y-1/2 text-[#687181]" />
            </span>

            {errors.password ? (
              <span className="auth-error">{errors.password.message}</span>
            ) : null}
          </label>

          <div className="mb-7 flex items-center justify-between px-[22px]">
            <label className="flex items-center gap-2 text-[10px] font-medium text-[#5f6876] dark:text-white/60">
              <input
                className="size-3.5 rounded border-[#9aa3af] accent-[#d90b32]"
                type="checkbox"
                {...register("remember")}
              />
              Remember me
            </label>

            <a className="text-[10px] font-extrabold text-brand-red">
              Forgot password?
            </a>
          </div>

          <button
            disabled={loading}
            className="flex h-[40px] w-full items-center justify-center gap-3 rounded-[12px] bg-[#d90b32] text-[12px] font-extrabold text-white shadow-[0_12px_22px_rgba(217,11,50,0.24)] disabled:opacity-70"
          >
            {loading ? (
              <span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : null}

            Sign In

            <ArrowRight className="size-3.5" />
          </button>
        </form>

        <div className="relative my-4 w-full text-center">
          <span className="relative z-10 bg-white/95 px-5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8a929e] dark:bg-[#1b1d22] dark:text-white/45">
            Or continue with
          </span>

          <span className="absolute left-1/2 top-1/2 h-[13px] w-[150px] -translate-x-1/2 -translate-y-1/2 bg-white/95 dark:bg-[#1b1d22]" />
        </div>

        <button className="flex h-[40px] w-full items-center justify-center gap-3 rounded-[14px] border border-[#d8dde5] bg-[#fbfcfd] text-[11px] font-extrabold text-brand-dark dark:border-white/10 dark:bg-white/5 dark:text-white">
          <span className="text-[14px] font-extrabold text-[#4285f4]">
            G
          </span>
          Sign in with Google
        </button>

        <p className="mt-5 text-[11px] font-medium text-[#5f6876] dark:text-white/60">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-extrabold text-brand-red">
            Sign up
          </Link>
        </p>
      </section>

      <footer className="absolute bottom-9 z-10 flex gap-10 text-[11px] font-medium text-[#7c8491] dark:text-white/50">
        <a>Privacy Policy</a>
        <a>Security</a>
      </footer>
    </main>
  );
}
