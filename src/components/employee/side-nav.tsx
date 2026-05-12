"use client";

import React from "react";
import {
  Blocks,
  ClipboardCheck,
  FileWarning,
} from "lucide-react";
import {
  SideNav as SharedSideNav,
  type NavItem,
} from "@/components/shared/side-nav";

const employeeNavItems: NavItem[] = [
  { title: "Dashboard", url: "/protected/employee", icon: Blocks },
  {
    title: "Evaluation",
    url: "/protected/employee/evaluation",
    icon: ClipboardCheck,
  },
  { title: "Remarks", url: "/protected/employee/remarks", icon: FileWarning },
];

const EmployeeSideNav = () => {
  return <SharedSideNav items={employeeNavItems} />;
};

export default EmployeeSideNav;
