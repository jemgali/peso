import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins"
import { hashPassword, verifyPassword } from "./password";
import { Resend } from "resend";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });
const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  
  emailAndPassword: {
    enabled: true,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
    autoSignIn: false,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url, token}, request) => {
      await resend.emails.send({
        from: "PESO <noreply@jemgali.tech>",
        to: user.email,
        subject: "Verify your email address",
        html: `<p>Hi ${user.name},</p><p>Please click <a href="${url}">here</a> to verify your email address.</p>`,
      })
    }
  },
  
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }
  },
  
  plugins: [
    nextCookies(),
    admin(),
  ]
});