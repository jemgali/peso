import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "http://192.168.25.138:3000",
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL as string,
  ],
  plugins: [adminClient()],
});
