export type AppRole = "PATIENT" | "PROVIDER" | "EMPLOYER_ADMIN" | "SUPER_ADMIN";

export type SessionUser = {
  id: string;
  role: AppRole;
  email: string;
  employerId?: string | null;
  patientId?: string | null;
  providerId?: string | null;
};
