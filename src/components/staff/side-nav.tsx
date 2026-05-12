"use client";

import React from "react";
import {
  Blocks,
  ClipboardCheck,
  Megaphone,
  FileWarning,
} from "lucide-react";
import {
  SideNav as SharedSideNav,
  type NavItem,
} from "@/components/shared/side-nav";

const staffNavItems: NavItem[] = [
  { title: "Dashboard", url: "/protected/staff", icon: Blocks },
  {
    title: "Evaluation",
    url: "/protected/staff/evaluation",
    icon: ClipboardCheck,
  },
  { title: "Remarks", url: "/protected/staff/remarks", icon: FileWarning },
];

const StaffSideNav = () => {
  return <SharedSideNav items={staffNavItems} />;
};

export default StaffSideNav;
