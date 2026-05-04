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

          // For OAuth signups (callback path), set emailVerified to false
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
                },
              });
            }
          } catch (error) {
            console.error("Failed to auto-create ProfileUser:", error);
          }
        },
      },
      update: {
        before: async (user) => {
          // Ensure emailVerified is a boolean even if better-auth tries to set a Date
          if (user.emailVerified !== undefined && user.emailVerified !== null) {
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

  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // After OAuth callback, if a new user was created, send verification email
      if (ctx.path.startsWith("/callback")) {
        const newSession = ctx.context.newSession;
        if (newSession && !newSession.user.emailVerified) {
          // Generate verification token and send email
          const token = crypto.randomUUID();
          const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

          // Store verification token in the verification table
          await prisma.verification.create({
            data: {
              id: crypto.randomUUID(),
              identifier: newSession.user.email,
              value: token,
              expiresAt,
            },
          });

          // Build verification URL with both token and email (identifier)
          const baseUrl =
            process.env.BETTER_AUTH_URL || "http://localhost:3000";
          const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(newSession.user.email)}&callbackURL=/auth/verified`;

          // Send verification email
          await resend.emails.send({
            from: "PESO <noreply@jemgali.tech>",
            to: newSession.user.email,
            subject: "Verify your email address",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #1f2937;">Verify your email</h1>
                <p style="color: #4b5563; margin-bottom: 24px;">Hi ${newSession.user.name},</p>
                <p style="color: #4b5563; margin-bottom: 24px;">Please click the button below to verify your email address and activate your PESO account.</p>
                <a href="${verifyUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">Verify Email Address</a>
                <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">If the button above doesn't work, copy and paste this link into your browser:</p>
                <p style="color: #9ca3af; font-size: 12px; word-break: break-all;">${verifyUrl}</p>
              </div>
            `,
          });

          // Redirect to verify-email page instead of callback URL
          return ctx.redirect(`/auth/verify-email?email=${encodeURIComponent(newSession.user.email)}`);
        }
      }
    }),
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
