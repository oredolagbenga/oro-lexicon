import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  ...authConfig,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.email = (user as any).email;
      }
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { id: true, role: true, email: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.email = dbUser.email;
          }
        } catch {}
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },
});
