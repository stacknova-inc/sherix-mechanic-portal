import { z } from "zod";

const SERVICE_ID_PATTERN = /^[a-f0-9]{24}$/i;

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
  businessInsurance: requiredFile("Business insurance"),
});

export const adminSchema = z
  .object({
    fullName: z.string().min(2, "Full name is required"),
    personalEmail: z.string().email("Enter a valid personal email"),
    password: z
      .string()
      .min(8, "Use at least 8 characters"),
    confirmPassword: z.string(),
    ghanaCard: requiredFile("Ghana Card upload"),
    servicesOffered: z
      .array(z.string().regex(SERVICE_ID_PATTERN, "Select services from the list"))
      .min(1, "Select at least one service"),
    workingHours: z.string().min(1, "Working hours is required"),
    insuranceUpload: requiredFile("Admin insurance"),
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
