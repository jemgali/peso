"use client"

import React from "react"
import { LayoutDashboard, FileText, ClipboardList } from "lucide-react"
import { SideNav as SharedSideNav, type NavItem } from "@/components/shared/side-nav"

const navItems: NavItem[] = [
  { title: "Dashboard", url: "/protected/client", icon: LayoutDashboard },
  { title: "Application Form", url: "/protected/client/application", icon: FileText },
  { title: "My Applications", url: "/protected/client/applications", icon: ClipboardList },
]

const SideNav = () => {
  return <SharedSideNav items={navItems} />
}

export default SideNav
