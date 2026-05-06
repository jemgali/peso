"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, LayoutDashboard, Loader2, LogOut, UserCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/ui/dropdown-menu";
import { Button } from "@/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";

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
        className="flex size-10 items-center justify-center rounded-full p-0"
      >
        <Loader2 className="h-5 w-5 animate-spin text-white/70" />
      </Button>
    );
  }

  if (!session?.user) return null;

  const user = session.user;
  const displayName = profileName || user.email;
  const role = user.role || "client";
  const isClient = role === "client";

  let dashboardRoute = "/protected";
  if (role === "admin") {
    dashboardRoute = "/protected";
  } else if (role === "employee") {
    dashboardRoute = "/protected/employee";
  }

  const initials = (profileName || user.email || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-white shadow-sm hover:bg-white/20 hover:text-white focus-visible:ring-0 focus-visible:ring-offset-0 h-auto transition-all"
        >
          <span className="text-sm font-medium truncate max-w-30 md:max-w-50">
            {profileName || user.email?.split("@")[0] || "Account"}
          </span>
          <Avatar className="size-8 border border-white/20">
            <AvatarImage src={user.image || undefined} />
            <AvatarFallback className="bg-primary/20 text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 mt-2 p-1">
        <DropdownMenuLabel className="p-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 border">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <p className="text-sm font-semibold truncate leading-none mb-1">
                  {profileName || "Account"}
                </p>
                <p className="text-xs text-muted-foreground truncate leading-none">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() => router.push("/")}
            className="cursor-pointer py-2.5"
          >
            <Home data-icon="inline-start" className="size-4" />
            Back to Home
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => router.push(dashboardRoute)}
            className="cursor-pointer py-2.5"
          >
            <LayoutDashboard data-icon="inline-start" className="size-4" />
            {isClient ? "SPES" : "Dashboard"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => router.push("/protected/profile")}
            className="cursor-pointer py-2.5"
          >
            <UserCircle data-icon="inline-start" className="size-4" />
            Profile Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleLogout}
          className="cursor-pointer py-2.5 text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut data-icon="inline-start" className="size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;
