import React from "react"
import { Briefcase } from "lucide-react"
import { SidebarShell } from "@/components/shared/sidebar-shell"
import SideNav from "./side-nav"
import type { AdminService } from "@/lib/constants/admin-service"

interface SideProps {
  service?: AdminService
}

const Side = ({ service }: SideProps) => {
  return (
    <SidebarShell title="PESO Admin" icon={Briefcase}>
      <SideNav service={service} />
    </SidebarShell>
  )
}

export default Side
