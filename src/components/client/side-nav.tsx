"use client"

import React from "react"
import Link from "next/link"
import { LayoutDashboard, FileText, ClipboardList } from "lucide-react"
import { useActivePath } from "@/hooks/use-active-path"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"

const navItems = [
  { title: "Dashboard", url: "/protected/client", icon: LayoutDashboard },
  { title: "Application Form", url: "/protected/client/application", icon: FileText },
  { title: "My Applications", url: "/protected/client/applications", icon: ClipboardList },
]

const SideNav = () => {
  const checkActive = useActivePath()

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            tooltip={item.title}
            isActive={checkActive(item.url)}
          >
            <Link href={item.url}>
              <item.icon />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

export default SideNav
