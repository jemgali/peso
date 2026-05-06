"use client"

import React from "react"
import Link from "next/link"
import { ChevronDown, FileText, LayoutDashboard, Megaphone, GraduationCap, ClipboardList } from "lucide-react"
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

const SideNav = ({ age, hasApplication, isGrantee }: { age?: number, hasApplication?: boolean, isGrantee?: boolean }) => {
  const isAgeIneligible = age !== undefined && (age < 14 || age > 31)
  const checkActive = useActivePath()
  const isApplicationSection = checkActive("/protected/client/application")
  const isGranteePortal = checkActive("/protected/client/application/documents")

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
            isActive={isApplicationSection && !isGranteePortal}
            tooltip="Applications"
          >
            <Link href={hasApplication || isGrantee ? "/protected/client/application/status" : "/protected/client/application"}>
              <ClipboardList />
              <span>Applications</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}

      {isGrantee && (
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isGranteePortal}
            tooltip="SPES Portal"
          >
            <Link href="/protected/client/application/documents">
              <GraduationCap />
              <span>SPES Portal</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  )
}

export default SideNav
