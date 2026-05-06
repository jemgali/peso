import React from "react"
import { Briefcase } from "lucide-react"
import { SidebarShell } from "@/components/shared/sidebar-shell"
import SideNav from "./side-nav"

const Side = ({ age, hasApplication, isGrantee }: { age?: number, hasApplication?: boolean, isGrantee?: boolean }) => {
  return (
    <SidebarShell title="PESO Portal" icon={Briefcase}>
      <SideNav age={age} hasApplication={hasApplication} isGrantee={isGrantee} />
    </SidebarShell>
  )
}

export default Side
