"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AuthUser,
  SignupFiles,
  SignupFormData,
  SignupStep,
} from "@/types/auth";

export const initialSignupData: SignupFormData = {
  companyName: "",
  businessEmail: "",
  companyNumber: "",
  coverage_area: "",
  bankDetails: "",
  fullName: "",
  personalEmail: "",
  password: "",
  confirmPassword: "",
  servicesOffered: "",
  workingHours: "",
  signedAgreementAccepted: false,
};

type AuthStore = {
  formData: SignupFormData;
  files: SignupFiles;
  currentStep: SignupStep;
  loading: boolean;
  user: AuthUser | null;
  token: string | null;
  error: string | null;
  success: string | null;
  setFormData: (data: Partial<SignupFormData>) => void;
  setFile: (key: keyof SignupFiles, file: File | null) => void;
  nextStep: () => void;
  previousStep: () => void;
  setCurrentStep: (step: SignupStep) => void;
  resetForm: () => void;
  setLoading: (loading: boolean) => void;
  setUser: (user: AuthUser | null, token?: string | null) => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      formData: initialSignupData,
      files: {},
      currentStep: 1,
      loading: false,
      user: null,
      token: null,
      error: null,
      success: null,
      setFormData: (data) =>
        set((state) => ({ formData: { ...state.formData, ...data } })),
      setFile: (key, file) =>
        set((state) => ({ files: { ...state.files, [key]: file } })),
      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 3) as SignupStep,
        })),
      previousStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1) as SignupStep,
        })),
      setCurrentStep: (step) => set({ currentStep: step }),
      resetForm: () =>
        set({
          formData: initialSignupData,
          files: {},
          currentStep: 1,
          error: null,
          success: null,
        }),
      setLoading: (loading) => set({ loading }),
      setUser: (user, token = null) => set({ user, token }),
      setError: (error) => set({ error }),
      setSuccess: (success) => set({ success }),
    }),
    {
      name: "sherix-auth-store",
      partialize: (state) => ({
        formData: state.formData,
        currentStep: state.currentStep,
        user: state.user,
        token: state.token,
      }),
    },
  ),
);
