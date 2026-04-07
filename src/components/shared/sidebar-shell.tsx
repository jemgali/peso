import React from "react"
import { LucideIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export interface SidebarShellProps {
  /** Title displayed in the sidebar header */
  title: string
  /** Icon component to display next to the title */
  icon: LucideIcon
  /** Navigation content to render inside the sidebar */
  children: React.ReactNode
  /** Optional group label for the navigation section */
  groupLabel?: string
}

export function SidebarShell({
  title,
  icon: Icon,
  children,
  groupLabel = "Navigation",
}: SidebarShellProps) {
  return (
    <Sidebar
      side="left"
      variant="floating"
      collapsible="icon"
      className="absolute! h-full!"
    >
      <SidebarHeader className="p-3">
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Icon className="size-4" />
            </div>
            <span className="truncate text-sm font-semibold">{title}</span>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
          <SidebarGroupContent>{children}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
