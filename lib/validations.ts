import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["PATIENT", "PROVIDER", "EMPLOYER_ADMIN", "SUPER_ADMIN"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const idParamSchema = z.object({
  id: z.string().min(1),
});

export const appointmentSchema = z.object({
  patientId: z.string().min(1),
  providerId: z.string().min(1),
  type: z.enum(["VIDEO", "AUDIO", "CHAT", "ASYNC"]),
  scheduledAt: z.coerce.date(),
  duration: z.number().int().min(10).max(120),
  chiefComplaint: z.string().min(2),
  notes: z.string().optional(),
});

export const createAppointmentSchema = appointmentSchema.extend({
  patientId: z.string().min(1).optional(),
});

export const appointmentFiltersSchema = z.object({
  status: z.enum(["SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  providerId: z.string().min(1).optional(),
});

export const appointmentStatusPatchSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]).optional(),
  notes: z.string().max(5000).optional(),
});

export const consultationTokenSchema = z.object({
  appointmentId: z.string().min(1),
});

export const providerSchema = z.object({
  userId: z.string().min(1).optional(),
  specialty: z.string().min(2),
  licenseNumber: z.string().min(3),
  licenseState: z.string().min(2),
  npiNumber: z.string().min(5),
  languages: z.array(z.string()).min(1),
  bio: z.string().optional(),
  availability: z.record(z.string(), z.unknown()),
  acceptingPatients: z.boolean().default(true),
});

export const providerFiltersSchema = z.object({
  specialty: z.string().min(1).optional(),
  language: z.string().min(1).optional(),
  availableOn: z.coerce.date().optional(),
  acceptingPatients: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const providerAvailabilityFiltersSchema = z.object({
  fromDate: z.coerce.date(),
  toDate: z.coerce.date(),
});

export const symptomSchema = z.object({
  date: z.coerce.date(),
  symptoms: z.record(z.string(), z.unknown()),
  mood: z.number().int().min(1).max(10),
  energy: z.number().int().min(1).max(10),
  sleep: z.number().min(0).max(24),
  pain: z.number().int().min(1).max(10),
  notes: z.string().optional(),
});

export const symptomFiltersSchema = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export const cycleSchema = z.object({
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date().optional(),
  ovulationDate: z.coerce.date().optional(),
  symptoms: z.array(z.string()).default([]),
  flow: z.enum(["LIGHT", "MEDIUM", "HEAVY"]),
  notes: z.string().optional(),
});

export const prescriptionSchema = z.object({
  patientId: z.string().min(1),
  providerId: z.string().min(1).optional(),
  appointmentId: z.string().optional(),
  medication: z.string().min(2),
  dosage: z.string().min(1),
  frequency: z.string().min(1),
  refills: z.number().int().min(0),
  pharmacyId: z.string().optional(),
  pharmacyName: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  instructions: z.string().optional(),
});

export const prescriptionPatchSchema = z.object({
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED"]).optional(),
  refillRequested: z.boolean().optional().default(false),
});

export const labSchema = z.object({
  patientId: z.string().min(1),
  appointmentId: z.string().optional(),
  testName: z.string().min(2),
  testCode: z.string().min(2),
  labProvider: z.enum(["LABCORP", "QUEST", "OTHER"]),
});

export const carePlanSchema = z.object({
  patientId: z.string().min(1),
  providerId: z.string().min(1).optional(),
  title: z.string().min(3),
  condition: z.string().min(2),
  goals: z.record(z.string(), z.unknown()),
  milestones: z.record(z.string(), z.unknown()),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

export const carePlanMilestonePatchSchema = z.object({
  milestoneKey: z.string().min(1),
  completed: z.boolean(),
});

export const referralSchema = z.object({
  patientId: z.string().min(1),
  referringProviderId: z.string().min(1).optional(),
  specialtyNeeded: z.string().min(2),
  urgency: z.enum(["ROUTINE", "URGENT", "EMERGENT"]),
  notes: z.string().optional(),
});

export const employerSchema = z.object({
  name: z.string().min(2),
  domain: z.string().min(2),
  contactEmail: z.string().email(),
  plan: z.enum(["BASIC", "PROFESSIONAL", "ENTERPRISE"]),
  employeeCount: z.number().int().nonnegative(),
  billingEmail: z.string().email(),
  ssoEnabled: z.boolean().default(false),
  ssoConfig: z.record(z.string(), z.unknown()).optional(),
});

export const insuranceVerifySchema = z.object({
  memberId: z.string().min(3),
  groupNumber: z.string().min(2),
  insuranceProvider: z.string().min(2),
});

export const paymentCheckoutSchema = z.object({
  appointmentId: z.string().min(1),
  appointmentType: z.enum(["VIDEO", "AUDIO", "CHAT", "ASYNC"]),
  specialty: z.string().min(2),
  currency: z.string().default("usd"),
});

export const patientRegistrationDetailsSchema = z.object({
  dateOfBirth: z.coerce.date(),
  phoneNumber: z.string().min(7),
  address: z.string().min(5),
  insuranceProvider: z.string().min(2).optional(),
  insuranceId: z.string().min(2).optional(),
});

export const providerRegistrationDetailsSchema = z.object({
  specialty: z.string().min(2),
  licenseNumber: z.string().min(3),
  licenseState: z.string().min(2),
  npiNumber: z.string().min(5),
  languages: z.array(z.string()).min(1),
  bio: z.string().optional(),
});

export const userRegistrationSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["PATIENT", "PROVIDER"]),
    patientDetails: patientRegistrationDetailsSchema.optional(),
    providerDetails: providerRegistrationDetailsSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === "PATIENT" && !data.patientDetails) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["patientDetails"],
        message: "Patient details are required for PATIENT role",
      });
    }
    if (data.role === "PROVIDER" && !data.providerDetails) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["providerDetails"],
        message: "Provider details are required for PROVIDER role",
      });
    }
  });

export const conversationCreateSchema = z
  .object({
    patientId: z.string().min(1).optional(),
    providerId: z.string().min(1).optional(),
    subject: z.string().min(1).max(160).optional(),
  })
  .refine((val) => Boolean(val.patientId && val.providerId), {
    message: "patientId and providerId are required",
    path: ["patientId"],
  });

export const conversationMessagePostSchema = z.object({
  content: z.string().min(1),
  messageType: z.enum(["TEXT", "FILE", "IMAGE"]).default("TEXT"),
});

export const messagePaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(50),
});
