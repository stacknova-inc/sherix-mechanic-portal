"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "@/services/auth-service";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/auth-store";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().default(false),
});

type LoginValues = z.infer<typeof loginSchema>;

export function SignInForm() {
  const { loading, setLoading, setUser, setError } = useAuthStore();
  const { toast } = useToast();
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
      const response = await signIn(values);
      setUser(response.user, response.token);
      toast({
        type: "success",
        message: response.message ?? "Signed in successfully.",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to sign in.";
      setError(message);
      toast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f4f6f8] px-5 py-5">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#eef1f5_0%,#fff1f3_34%,#ffffff_51%,#f7e8ec_68%,#e9edf3_100%)]" />

      <section className="relative z-10 flex min-h-[540px] w-full max-w-[450px] flex-col items-center rounded-[3px] bg-white/95 px-[56px] pb-10 pt-11 shadow-[0_30px_90px_rgba(23,25,31,0.13)] backdrop-blur-sm">
        <div className="mb-4 flex items-center gap-3 text-brand-red">
          <span className="size-7 rounded-full bg-[#d90b32]" />
          <span className="text-[18px] font-extrabold">Sherix</span>
        </div>
        <h1 className="mb-9 text-center text-[26px] font-extrabold tracking-[-0.02em] text-brand-dark">
          Welcome Back!
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <label className="mb-5 block">
            <span className="mb-2.5 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6f7784]">
              Email Address
            </span>
            <span className="relative block">
              <Mail className="absolute left-4 top-1/2 size-[15px] -translate-y-1/2 text-[#7c8491]" />
              <input
                className="h-[42px] w-full rounded-[14px] border border-[#d8dde5] bg-[#fbfcfd] pl-10 pr-4 text-[12px] font-medium text-brand-dark outline-none placeholder:text-[#9aa2ae] focus:border-[#d90b32] focus:ring-4 focus:ring-[#fde8ed]"
                placeholder="e.g. alex@sherix.com"
                {...register("email")}
              />
            </span>
            {errors.email ? (
              <span className="auth-error">{errors.email.message}</span>
            ) : null}
          </label>

          <label className="mb-5 block">
            <span className="mb-2.5 block text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#6f7784]">
              Password
            </span>
            <span className="relative block">
              <LockKeyhole className="absolute left-4 top-1/2 size-[15px] -translate-y-1/2 text-[#7c8491]" />
              <input
                className="h-[42px] w-full rounded-[14px] border border-[#d8dde5] bg-[#fbfcfd] pl-10 pr-10 text-[12px] font-medium text-brand-dark outline-none placeholder:text-[#9aa2ae] focus:border-[#d90b32] focus:ring-4 focus:ring-[#fde8ed]"
                placeholder="Enter your password"
                type="password"
                {...register("password")}
              />
              <Eye className="absolute right-4 top-1/2 size-[14px] -translate-y-1/2 text-[#687181]" />
            </span>
            {errors.password ? (
              <span className="auth-error">{errors.password.message}</span>
            ) : null}
          </label>

          <div className="mb-7 flex items-center justify-between px-[22px]">
            <label className="flex items-center gap-2 text-[11px] font-medium text-[#5f6876]">
              <input
                className="size-3.5 rounded border-[#9aa3af] accent-[#d90b32]"
                type="checkbox"
                {...register("remember")}
              />
              Remember me
            </label>
            <a className="text-[11px] font-extrabold text-brand-red">
              Forgot password?
            </a>
          </div>

          <button
            disabled={loading}
            className="flex h-[44px] w-full items-center justify-center gap-3 rounded-[14px] bg-[#d90b32] text-[13px] font-extrabold text-white shadow-[0_12px_22px_rgba(217,11,50,0.24)] disabled:opacity-70"
          >
            {loading ? (
              <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : null}
            Sign In <span className="text-[26px] leading-none">›</span>
          </button>
        </form>

        <div className="relative my-5 w-full text-center">
          <span className="relative z-10 bg-white/95 px-5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8a929e]">
            Or continue with
          </span>
          <span className="absolute left-1/2 top-1/2 h-[13px] w-[150px] -translate-x-1/2 -translate-y-1/2 bg-white/95" />
        </div>

        <button className="flex h-[46px] w-full items-center justify-center gap-4 rounded-[16px] border border-[#d8dde5] bg-[#fbfcfd] text-[12px] font-extrabold text-brand-dark">
          <span className="text-[15px] font-extrabold text-[#4285f4]">G</span>
          Sign in with Google
        </button>

        <p className="mt-6 text-[12px] font-medium text-[#5f6876]">
          Don&apos;t have an account?{" "}
          <Link href="/" className="font-extrabold text-brand-red">
            Sign up
          </Link>
        </p>
      </section>

      <footer className="absolute bottom-9 z-10 flex gap-10 text-[11px] font-medium text-[#7c8491]">
        <a>Privacy Policy</a>
        <a>Security</a>
      </footer>
    </main>
  );
}
