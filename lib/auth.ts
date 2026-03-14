import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { loginSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(rawCredentials) {
        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: {
            patient: { select: { id: true } },
            provider: { select: { id: true } },
            employerAdmin: { select: { employerId: true } },
          },
        });

        if (!user) return null;

        const isValid = await compare(parsed.data.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          patientId: user.patient?.id ?? null,
          providerId: user.provider?.id ?? null,
          employerId: user.employerAdmin?.employerId ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role as never;
        token.patientId = (user as { patientId?: string | null }).patientId ?? null;
        token.providerId = (user as { providerId?: string | null }).providerId ?? null;
        token.employerId = (user as { employerId?: string | null }).employerId ?? null;
      }

      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          include: {
            patient: { select: { id: true } },
            provider: { select: { id: true } },
            employerAdmin: { select: { employerId: true } },
          },
        });
        if (dbUser) {
          token.sub = dbUser.id;
          token.role = dbUser.role;
          token.patientId = dbUser.patient?.id ?? null;
          token.providerId = dbUser.provider?.id ?? null;
          token.employerId = dbUser.employerAdmin?.employerId ?? null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as never;
        session.user.patientId = token.patientId ?? null;
        session.user.providerId = token.providerId ?? null;
        session.user.employerId = token.employerId ?? null;
      }
      return session;
    },
  },
  trustHost: true,
});
