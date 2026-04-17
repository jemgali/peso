"use client"

import React from "react"
import Link from "next/link"
import { ChevronDown, FileText, LayoutDashboard } from "lucide-react"
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

const SideNav = () => {
  const checkActive = useActivePath()
  const isApplicationSection =
    checkActive("/protected/client/application") ||
    checkActive("/protected/client/application/gip") ||
    checkActive("/protected/client/application/dilp")

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
        <Collapsible defaultOpen={isApplicationSection} className="group/collapse">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton isActive={isApplicationSection} tooltip="Application Form">
              <FileText />
              <span>Application Form</span>
              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapse:rotate-180" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  asChild
                  isActive={checkActive("/protected/client/application")}
                >
                  <Link href="/protected/client/application">SPES</Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  asChild
                  isActive={checkActive("/protected/client/application/gip")}
                >
                  <Link href="/protected/client/application/gip">GIP</Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
              <SidebarMenuSubItem>
                <SidebarMenuSubButton
                  asChild
                  isActive={checkActive("/protected/client/application/dilp")}
                >
                  <Link href="/protected/client/application/dilp">DILP</Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default SideNav
