"use client"

import React from 'react'
import Link from 'next/link'
import { Blocks, CalendarDays, Users, Megaphone, Handshake, FolderPlus, FileText } from "lucide-react"
import { useActivePath } from '@/hooks/use-active-path'
import {
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/ui/sidebar'

const navItems =[
    { title: "Dashboard", url: "/protected/admin", icon: Blocks },
    { title: "Programs", url: "/protected/admin/programs", icon: Handshake },
    { title: "Announcements", url: "/protected/admin/announcements", icon: Megaphone },
    { title: "Applications", url: "/protected/admin/applications", icon: FolderPlus },
    { title: "Schedule", url: "/protected/admin/schedule", icon: CalendarDays },
    { title: "Users", url: "/protected/admin/users", icon: Users },
    { title: "Reports", url: "/protected/admin/reports", icon: FileText },
]

const SideNav = () => {
    const checkActive = useActivePath()

  return (
    <SidebarMenu>
        {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild tooltip={item.title} isActive={checkActive(item.url)}>
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