"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AuthUser,
  SignupFiles,
  SignupFormData,
  SignupStep,
} from "@/types/auth";

const SIGNUP_FORM_DATA_KEYS = [
  "companyName",
  "businessEmail",
  "companyNumber",
  "coverage_area",
  "fullName",
  "personalEmail",
  "password",
  "confirmPassword",
  "servicesOffered",
  "workingHours",
  "signedAgreementAccepted",
] as const satisfies readonly (keyof SignupFormData)[];

export const initialSignupData: SignupFormData = {
  companyName: "",
  businessEmail: "",
  companyNumber: "",
  coverage_area: "",
  fullName: "",
  personalEmail: "",
  password: "",
  confirmPassword: "",
  servicesOffered: [],
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
  selectedServiceId: string | null;
  sidebarCollapsed: boolean;
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
  setSelectedServiceId: (serviceId: string | null) => void;
  toggleSidebarCollapsed: () => void;
  setError: (error: string | null) => void;
  setSuccess: (success: string | null) => void;
};

function pickSignupFormData(data: Partial<SignupFormData>) {
  return SIGNUP_FORM_DATA_KEYS.reduce<Partial<SignupFormData>>((payload, key) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      payload[key] = data[key] as never;
    }

    return payload;
  }, {});
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      formData: initialSignupData,
      files: {},
      currentStep: 1,
      loading: false,
      user: null,
      token: null,
      selectedServiceId: null,
      sidebarCollapsed: false,
      error: null,
      success: null,
      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...pickSignupFormData(data) },
        })),
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
      setSelectedServiceId: (serviceId) => set({ selectedServiceId: serviceId }),
      toggleSidebarCollapsed: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setError: (error) => set({ error }),
      setSuccess: (success) => set({ success }),
    }),
    {
      name: "sherix-auth-store",
      merge: (persistedState, currentState) => {
        const persisted =
          typeof persistedState === "object" && persistedState !== null
            ? (persistedState as Partial<AuthStore>)
            : {};

        return {
          ...currentState,
          user: persisted.user ?? currentState.user,
          token: persisted.token ?? currentState.token,
          selectedServiceId:
            persisted.selectedServiceId ?? currentState.selectedServiceId,
          sidebarCollapsed:
            persisted.sidebarCollapsed ?? currentState.sidebarCollapsed,
        };
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        selectedServiceId: state.selectedServiceId,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    },
  ),
);
