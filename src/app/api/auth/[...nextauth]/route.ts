// import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { AuthOptions } from "next-auth";
import { Session, User as NextAuthUser } from "next-auth";
import { User } from "@prisma/client";
import { AdapterUser } from "next-auth/adapters";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: NextAuthUser & {
      id: string;
      role?: User['role'];
    };
  }
}

const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "email@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        // Vérifier l'utilisateur dans la base de données
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No user found");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async session({ session, user }: { 
      session: Session; 
      user: AdapterUser;
    }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as unknown as User).role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
};

export const { GET, POST } = NextAuth(authOptions);
