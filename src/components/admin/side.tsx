import React from "react"
import { Briefcase } from "lucide-react"
import { SidebarShell } from "@/components/shared/sidebar-shell"
import SideNav from "./side-nav"

const Side = () => {
  return (
    <SidebarShell title="PESO Admin" icon={Briefcase}>
      <SideNav />
    </SidebarShell>
  )
}

export default Side