import React from "react"
import { Briefcase } from "lucide-react"
import { SidebarShell } from "@/components/shared/sidebar-shell"
import SideNav from "./side-nav"

const Side = ({ age }: { age?: number }) => {
  return (
    <SidebarShell title="PESO Portal" icon={Briefcase}>
      <SideNav age={age} />
    </SidebarShell>
  )
}

export default Side
