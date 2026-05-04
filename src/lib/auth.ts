/* eslint-disable @typescript-eslint/no-explicit-any */
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
// If your Prisma file is located elsewhere, you can change the path
import { PrismaClient } from "@/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomInt } from "node:crypto";
import { nextCookies } from "better-auth/next-js";
import { admin, emailOTP } from "better-auth/plugins";
import { hashPassword, verifyPassword } from "./password";
import { Resend } from "resend";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });
const resend = new Resend(process.env.RESEND_API_KEY);
const OTP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateAlphanumericOtp(length = 8): string {
  return Array.from({ length }, () =>
    OTP_CHARS[randomInt(0, OTP_CHARS.length)]
  ).join("");
}

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
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: "PESO <noreply@jemgali.tech>",
        to: user.email,
        subject: "Verify your email address",
        html: `<p>Hi ${user.name},</p><p>Please click <a href="${url}">here</a> to verify your email address.</p>`,
      });
    },
  },

  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
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
          // Normalize auth defaults: app uses "client" instead of generic "user".
          const normalizedRole =
            !user.role || user.role === "user" ? "client" : user.role;

          // For OAuth signups (callback path), force emailVerified to false 
          // so they must go through our verification flow.
          if (ctx?.path?.startsWith("/callback")) {
            return {
              data: {
                ...user,
                role: normalizedRole,
                emailVerified: false,
              },
            };
          }

          return {
            data: {
              ...user,
              role: normalizedRole,
            },
          };
        },
        after: async (user) => {
          // 1. Auto-create ProfileUser in public schema
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
                },
              });
            }
          } catch (error) {
            console.error("Failed to auto-create ProfileUser:", error);
          }

          // 2. If user is unverified (OAuth case), trigger verification email
          if (!user.emailVerified) {
            try {
              // Note: Since we are in an adapter hook, we use our exported auth instance 
              // or ctx.api if available. Here we'll use the auth.api directly.
              const { auth } = await import("./auth");
              await auth.api.sendVerificationEmail({
                body: {
                  email: user.email,
                  callbackURL: "/auth/verified",
                },
              });
            } catch (error) {
              console.error("Failed to send automatic verification email:", error);
            }
          }
        },
      },
      update: {
        before: async (user) => {
          // Only convert if it's a truthy non-boolean (like a Date from better-auth)
          if (
            user.emailVerified !== undefined &&
            user.emailVerified !== null &&
            typeof user.emailVerified !== "boolean"
          ) {
            return {
              data: {
                ...user,
                emailVerified: !!user.emailVerified,
              },
            };
          }
        },
      },
    },
  },

  plugins: [
    nextCookies() as any,
    admin(),
    emailOTP({
      otpLength: 8,
      expiresIn: 15 * 60,
      generateOTP: () => generateAlphanumericOtp(8),
      sendVerificationOTP: async ({ email, otp, type }) => {
        if (type !== "forget-password") {
          return;
        }

        await resend.emails.send({
          from: "PESO <noreply@jemgali.tech>",
          to: email,
          subject: "Your PESO password reset code",
          html: `<p>You requested to reset your PESO password.</p><p>Your verification code is:</p><p style="font-size:20px;font-weight:700;letter-spacing:2px;">${otp}</p><p>This code expires in 15 minutes.</p>`,
        });
      },
    }),
  ],
});
