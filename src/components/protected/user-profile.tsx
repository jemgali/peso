"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/ui/dropdown-menu";
import { Button } from "@/ui/button";

interface ProfileNameResponse {
  success: boolean;
  data?: {
    firstName: string | null;
    lastName: string | null;
  };
}

const UserProfile = () => {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const [profileName, setProfileName] = useState<string | null>(null);
  const userId = session?.user?.id;

  useEffect(() => {
    let active = true;

    const fetchProfileName = async () => {
      if (!userId) {
        if (active) {
          setProfileName(null);
        }
        return;
      }

      try {
        const response = await fetch("/api/client/profile-name");
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as ProfileNameResponse;
        if (!data.success || !data.data) {
          return;
        }

        const firstName = data.data.firstName?.trim() || "";
        const lastName = data.data.lastName?.trim() || "";
        const fullName = [firstName, lastName].filter(Boolean).join(" ");

        if (active) {
          setProfileName(fullName || null);
        }
      } catch (error) {
        console.error("Error fetching profile name:", error);
      }
    };

    fetchProfileName();

    return () => {
      active = false;
    };
  }, [userId]);

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/sign-in");
        },
      },
    });
  };

  if (isPending) {
    return (
      <Button
        variant="ghost"
        className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
      >
        <Loader2 className="h-5 w-5 animate-spin text-white/70" />
      </Button>
    );
  }

  if (!session?.user) return null;

  const user = session.user;
  const displayName = profileName || user.email;
  const role = user.role || "client";

  let dashboardRoute = "/protected";
  if (role === "admin") {
    dashboardRoute = "/protected";
  } else if (role === "employee") {
    dashboardRoute = "/protected/employee";
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-white shadow-sm hover:bg-white/20 hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0 h-auto transition-all"
        >
          <span className="text-sm font-medium truncate max-w-30 md:max-w-50">
            {displayName}
          </span>
          <UserCircle className="w-6 h-6" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-2">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">
              {displayName || "Account"}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => router.push(dashboardRoute)}
          className="cursor-pointer w-full"
        >
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleLogout}
          className="cursor-pointer w-full text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
