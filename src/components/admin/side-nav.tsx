"use client";

import React from "react";
import {
  ArrowLeft,
  Blocks,
  CalendarDays,
  Users,
  Megaphone,
  Handshake,
  FileText,
  FolderPlus,
  ClipboardCheck,
  Layers,
} from "lucide-react";
import { usePathname } from "next/navigation";
import {
  SideNav as SharedSideNav,
  type NavItem,
} from "@/components/shared/side-nav";
import type { AdminService } from "@/lib/constants/admin-service";

const generalNavItems: NavItem[] = [
  { title: "Dashboard", url: "/protected/admin", icon: Blocks },
  { title: "Programs", url: "/protected/admin/programs", icon: Handshake },
  {
    title: "Announcements",
    url: "/protected/admin/announcements",
    icon: Megaphone,
  },
  { title: "Schedule", url: "/protected/admin/schedule", icon: CalendarDays },
  { title: "Users", url: "/protected/admin/users", icon: Users },
  { title: "Reports", url: "/protected/admin/reports", icon: FileText },
];

const spesNavItems: NavItem[] = [
  {
    title: "Applications",
    url: "/protected/admin/applications",
    icon: FolderPlus,
  },
  {
    title: "Evaluation",
    url: "/protected/admin/evaluation",
    icon: ClipboardCheck,
  },
  { title: "Batch Management", url: "/protected/admin/batches", icon: Layers },
];

interface SideNavProps {
  service?: AdminService;
}

function isGeneralRoute(pathname: string): boolean {
  return (
    pathname === "/protected/admin" ||
    pathname.startsWith("/protected/admin/programs") ||
    pathname.startsWith("/protected/admin/announcements") ||
    pathname.startsWith("/protected/admin/schedule") ||
    pathname.startsWith("/protected/admin/users") ||
    pathname.startsWith("/protected/admin/reports")
  );
}

function isSpesRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/protected/admin/applications") ||
    pathname.startsWith("/protected/admin/evaluation") ||
    pathname.startsWith("/protected/admin/batches")
  );
}

const SideNav = ({ service }: SideNavProps) => {
  const pathname = usePathname();
  const backToProgramsItem: NavItem = {
    title: "Go Back to Programs",
    url: "/protected/admin/programs",
    icon: ArrowLeft,
  };
  const useSpesMode = service === "spes" && isSpesRoute(pathname);

  const items = useSpesMode
    ? [backToProgramsItem, ...spesNavItems]
    : generalNavItems;

  if (!useSpesMode && !isGeneralRoute(pathname)) {
    return <SharedSideNav items={generalNavItems} />;
  }

  return <SharedSideNav items={items} />;
};

export default SideNav;
