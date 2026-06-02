"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, LockKeyhole, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signIn } from "@/services/auth-service";
import { getApiErrorDetails } from "@/services/api-error";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/auth-store";
import { ThemeToggle } from "@/features/theme/ThemeToggle";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().default(false),
});

type LoginValues = z.infer<typeof loginSchema>;

export function SignInForm() {
  const router = useRouter();
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
      console.info("[Auth][Login][Form] Submitting sign-in form", {
        email: values.email.trim(),
        hasPassword: Boolean(values.password),
      });
      const response = await signIn(values);
      setUser(response.user, response.token);
      toast({
        type: "success",
        message: response.message ?? "Signed in successfully.",
      });
      console.info("[Auth][Login][Form] Sign-in succeeded; redirecting to dashboard", {
        userEmail: response.user.email,
        userRole: response.user.role,
      });
      router.push("/dashboard");
    } catch (error) {
      const details = getApiErrorDetails(error, "Unable to sign in.");
      const message = `${details.message} (${details.reason.replaceAll("_", " ")})`;
      console.error("[Auth] Authentication failed", details);
      setError(message);
      toast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8c3cd] px-5 py-5 transition-colors dark:bg-[#121419]">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,#f4b4c0_0%,#f7cbd2_34%,#fff_51%,#f8c8d1_68%,#f3b6c2_100%)] dark:bg-[linear-gradient(145deg,#2a1016_0%,#17191f_38%,#121419_62%,#251016_100%)]" />
      <div className="absolute right-5 top-5 z-20">
        <ThemeToggle />
      </div>

      <section className="relative z-10 flex min-h-[610px] w-full max-w-[520px] flex-col items-center rounded-[3px] bg-white/88 px-[72px] pb-12 pt-14 shadow-signin backdrop-blur-sm transition-colors dark:bg-[#1b1d22]/90">
        <div className="mb-5 flex items-center gap-3 text-brand-red">
          <span className="size-8 rounded-full bg-brand-red" />
          <span className="text-[20px] font-extrabold">Sherix</span>
        </div>
        <h1 className="mb-12 text-center text-[30px] font-extrabold tracking-[-0.02em] text-brand-dark dark:text-white">
          Welcome Back!
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <label className="mb-6 block">
            <span className="mb-3 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#7f8794] dark:text-white/60">
              Email Address
            </span>
            <span className="relative block">
              <Mail className="absolute left-5 top-1/2 size-[17px] -translate-y-1/2 text-[#7f8794]" />
              <input
                className="h-[48px] w-full rounded-[18px] border border-[#dfe3e9] bg-white/70 pl-12 pr-4 text-[13px] font-medium outline-none placeholder:text-[#8e96a3] focus:border-brand-red focus:ring-4 focus:ring-red-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-red-950/30"
                placeholder="e.g. alex@sherix.com"
                {...register("email")}
              />
            </span>
            {errors.email ? (
              <span className="auth-error">{errors.email.message}</span>
            ) : null}
          </label>

          <label className="mb-6 block">
            <span className="mb-3 block text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#7f8794] dark:text-white/60">
              Password
            </span>
            <span className="relative block">
              <LockKeyhole className="absolute left-5 top-1/2 size-[17px] -translate-y-1/2 text-[#7f8794]" />
              <input
                className="h-[48px] w-full rounded-[18px] border border-[#dfe3e9] bg-white/70 pl-12 pr-12 text-[13px] font-medium outline-none placeholder:text-[#8e96a3] focus:border-brand-red focus:ring-4 focus:ring-red-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-red-950/30"
                placeholder="Enter your password"
                type="password"
                {...register("password")}
              />
              <Eye className="absolute right-5 top-1/2 size-[15px] -translate-y-1/2 text-[#536070]" />
            </span>
            {errors.password ? (
              <span className="auth-error">{errors.password.message}</span>
            ) : null}
          </label>

          <div className="mb-9 flex items-center justify-between px-[30px]">
            <label className="flex items-center gap-2 text-[12px] font-medium text-[#536070] dark:text-white/60">
              <input
                className="size-4 rounded border-[#9ba3ae]"
                type="checkbox"
                {...register("remember")}
              />
              Remember me
            </label>
            <a className="text-[12px] font-extrabold text-brand-red">
              Forgot password?
            </a>
          </div>

          <button
            disabled={loading}
            className="flex h-[50px] w-full items-center justify-center gap-5 rounded-[17px] bg-brand-red text-[15px] font-extrabold text-white shadow-[0_12px_18px_rgba(228,7,47,0.26)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <span className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : null}
            Sign In <ArrowRight className="size-3.5" />
          </button>
        </form>

        <div className="relative my-5 w-full text-center">
          <span className="relative z-10 bg-white/90 px-5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8f96a3] dark:bg-[#1b1d22] dark:text-white/45">
            Or continue with
          </span>
          <span className="absolute left-1/2 top-1/2 h-[13px] w-[150px] -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#1b1d22]" />
        </div>

        <button className="flex h-[46px] w-full items-center justify-center gap-4 rounded-[16px] border border-[#dfe3e9] bg-white/70 text-[12px] font-extrabold text-brand-dark dark:border-white/10 dark:bg-white/5 dark:text-white">
          <span className="text-[15px] font-extrabold text-[#4285f4]">G</span>
          Sign in with Google
        </button>

        <p className="mt-6 text-[12px] font-medium text-[#536070] dark:text-white/60">
          Don&apos;t have an account?{" "}
          <Link href="/" className="font-extrabold text-brand-red">
            Sign up
          </Link>
        </p>
      </section>

      <footer className="absolute bottom-9 z-10 flex gap-10 text-[11px] font-medium text-[#8f96a3]">
        <a>Privacy Policy</a>
        <a>Security</a>
      </footer>
    </main>
  );
}
