"use client"

import React from "react"
import {
  Blocks,
  CalendarDays,
  Users,
  Megaphone,
  Handshake,
  FolderPlus,
  FileText,
} from "lucide-react"
import { SideNav as SharedSideNav, type NavItem } from "@/components/shared/side-nav"

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/protected/admin", icon: Blocks },
  { title: "Programs", url: "/protected/admin/programs", icon: Handshake },
  { title: "Announcements", url: "/protected/admin/announcements", icon: Megaphone },
  { title: "Applications", url: "/protected/admin/applications", icon: FolderPlus },
  { title: "Schedule", url: "/protected/admin/schedule", icon: CalendarDays },
  { title: "Users", url: "/protected/admin/users", icon: Users },
  { title: "Reports", url: "/protected/admin/reports", icon: FileText },
]

const SideNav = () => {
  return <SharedSideNav items={navItems} />
}

export default SideNav