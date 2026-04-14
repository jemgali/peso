import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
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
  
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "client",
      },
    },
  },
  
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          // For OAuth signups (callback path), set emailVerified to false
          if (ctx?.path?.startsWith("/callback")) {
            return {
              data: {
                ...user,
                emailVerified: false,
              },
            };
          }
          return { data: user };
        },
        after: async (user) => {
          // Auto-create ProfileUser in public schema with email + role
          try {
            const existing = await prisma.profileUser.findUnique({
              where: { userId: user.id },
            });
            if (!existing) {
              await prisma.profileUser.create({
                data: {
                  profileId: crypto.randomUUID(),
                  userId: user.id,
                  profileEmail: user.email,
                  profileRole: (user.role as string) || "client",
                },
              });
            }
          } catch (error) {
            console.error("Failed to auto-create ProfileUser:", error);
          }
        },
      },
    },
  },
  
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // After OAuth callback, if a new user was created, send verification email
      if (ctx.path.startsWith("/callback")) {
        const newSession = ctx.context.newSession;
        if (newSession && !newSession.user.emailVerified) {
          // Generate verification token and send email
          const token = crypto.randomUUID();
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
          
          // Store verification token
          await prisma.verification.create({
            data: {
              id: crypto.randomUUID(),
              identifier: newSession.user.email,
              value: token,
              expiresAt,
            },
          });
          
          // Build verification URL
          const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
          const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}&callbackURL=/auth/verified`;
          
          // Send verification email
          await resend.emails.send({
            from: "PESO <noreply@jemgali.tech>",
            to: newSession.user.email,
            subject: "Verify your email address",
            html: `<p>Hi ${newSession.user.name},</p><p>Please click <a href="${verifyUrl}">here</a> to verify your email address.</p>`,
          });
          
          // Redirect to verify-email page instead of callback URL
          return ctx.redirect("/auth/verify-email");
        }
      }
    }),
  },
  
  plugins: [
    nextCookies() as any,
    admin(),
  ]
});