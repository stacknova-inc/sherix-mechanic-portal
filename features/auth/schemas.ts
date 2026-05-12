import { z } from "zod";

const requiredFile = (label: string) =>
  z.custom<File>(
    (file) => file instanceof File && file.size > 0,
    `${label} is required`,
  );

export const companySchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  businessEmail: z.string().email("Enter a valid business email"),
  companyNumber: z.string().min(7, "Company number is required"),
  coverage_area: z.string().min(2, "coverage_area is required"),
  registrationCertificate: requiredFile("Registration certificate"),
  garageProof: requiredFile("Proof of garage/workshop address"),
  bankDetails: z.string().min(8, "Bank or momo details are required"),
  businessInsurance: z.instanceof(File).nullable().optional(),
});

export const adminSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    personalEmail: z.string().email("Enter a valid personal email"),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[0-9]/, "Include a number"),
    confirmPassword: z.string(),
    ghanaCard: requiredFile("Ghana Card upload"),
    servicesOffered: z.string().min(3, "Services offered is required"),
    workingHours: z.string().min(3, "Working hours is required"),
    insuranceUpload: z.instanceof(File).nullable().optional(),
    signedAgreementAccepted: z
      .boolean()
      .refine((value) => value, "You must read and accept the signed agreement"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CompanyFormValues = z.infer<typeof companySchema>;
export type AdminFormValues = z.infer<typeof adminSchema>;
