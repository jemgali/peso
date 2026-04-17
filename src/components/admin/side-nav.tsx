"use client"

import React from "react"
import {
  Blocks,
  ClipboardCheck,
  CalendarDays,
  Users,
  Megaphone,
  Handshake,
  FolderPlus,
  FileText,
  Layers,
} from "lucide-react"
import { SideNav as SharedSideNav, type NavItem } from "@/components/shared/side-nav"
import type { AdminService } from "@/lib/constants/admin-service"

const spesNavItems: NavItem[] = [
  { title: "Dashboard", url: "/protected/admin", icon: Blocks },
  { title: "Programs", url: "/protected/admin/programs", icon: Handshake },
  { title: "Announcements", url: "/protected/admin/announcements", icon: Megaphone },
  { title: "Applications", url: "/protected/admin/applications", icon: FolderPlus },
  { title: "Evaluation", url: "/protected/admin/evaluation", icon: ClipboardCheck },
  { title: "Batch Management", url: "/protected/admin/batches", icon: Layers },
  { title: "Schedule", url: "/protected/admin/schedule", icon: CalendarDays },
  { title: "Users", url: "/protected/admin/users", icon: Users },
  { title: "Reports", url: "/protected/admin/reports", icon: FileText },
]

const fallbackNavItems: NavItem[] = [
  { title: "Dashboard", url: "/protected/admin", icon: Blocks },
]

interface SideNavProps {
  service: AdminService
}

const SideNav = ({ service }: SideNavProps) => {
  const items = service === "spes" ? spesNavItems : fallbackNavItems
  return <SharedSideNav items={items} />
}

export default SideNav
