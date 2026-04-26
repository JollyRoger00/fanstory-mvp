import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/client";
import { getServerEnv } from "@/lib/env/server";
import { authorizeEmailCodeSignIn } from "@/server/auth/email-code";

const env = getServerEnv();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  secret: env.AUTH_SECRET,
  trustHost: env.AUTH_TRUST_HOST,
  providers: [
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      id: "email-code",
      name: "Email code",
      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        code: {
          label: "Code",
          type: "text",
        },
      },
      authorize: authorizeEmailCodeSignIn,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.role) {
        token.role = user.role;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role =
          typeof token.role === "string" ? token.role : "USER";
      }

      return session;
    },
  },
});
