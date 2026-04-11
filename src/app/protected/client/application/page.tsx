import React from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import ApplicationForm from "@/components/client/content/application-form";

const Page = async () => {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });
  
  const userEmail = session?.user?.email || "";
  
  return <ApplicationForm userEmail={userEmail} />;
};

export default Page;
