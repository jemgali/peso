import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function requireUser() {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session || !session.user) {
    redirect("/auth/sign-in");
  }

  let isVerified = session.user.emailVerified;

  // Bypass better-auth cache: if session says not verified, double-check the DB
  if (!isVerified) {
    const { prisma } = await import('@/lib/prisma');
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true }
    });
    
    if (dbUser?.emailVerified) {
      isVerified = true;
    }
  }

  // Require email verification
  if (!isVerified) {
    redirect("/auth/verify-email");
  }

  return { ...session.user, emailVerified: isVerified };

}
