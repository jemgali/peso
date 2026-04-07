"use client"

import React from "react"
import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { useActivePath } from "@/hooks/use-active-path"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
}

export interface SideNavProps {
  items: NavItem[]
}

export function SideNav({ items }: SideNavProps) {
  const checkActive = useActivePath()

  return (
    <SidebarMenu>
      {items.map((item) => (
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
