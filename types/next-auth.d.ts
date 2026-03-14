import { Role } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      employerId?: string | null;
      providerId?: string | null;
      patientId?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role;
    employerId?: string | null;
    providerId?: string | null;
    patientId?: string | null;
  }
}
