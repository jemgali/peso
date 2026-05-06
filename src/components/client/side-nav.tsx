"use client"

import React from "react"
import Link from "next/link"
import { ChevronDown, FileText, LayoutDashboard, Megaphone } from "lucide-react"
import { useActivePath } from "@/hooks/use-active-path"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const SideNav = ({ age }: { age?: number }) => {
  const isAgeIneligible = age !== undefined && (age < 14 || age > 31)
  const checkActive = useActivePath()
  const isApplicationSection = checkActive("/protected/client/application")

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={checkActive("/protected/client")} tooltip="Dashboard">
          <Link href="/protected/client">
            <LayoutDashboard />
            <span>Dashboard</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={checkActive("/protected/client/announcements")}
          tooltip="Announcements"
        >
          <Link href="/protected/client/announcements">
            <Megaphone />
            <span>Announcements</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {!isAgeIneligible && (
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isApplicationSection}
            tooltip="Application Form"
          >
            <Link href="/protected/client/application">
              <FileText />
              <span>Application Form</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  )
}

export default SideNav
