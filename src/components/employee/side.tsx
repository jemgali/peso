import React from "react"
import { Briefcase } from "lucide-react"
import { SidebarShell } from "@/components/shared/sidebar-shell"
import EmployeeSideNav from "./side-nav"

const EmployeeSide = () => {
  return (
    <SidebarShell title="PESO Employee" icon={Briefcase}>
      <EmployeeSideNav />
    </SidebarShell>
  )
}

export default EmployeeSide
