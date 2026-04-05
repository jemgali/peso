"use client";

import React from "react";
import SPESApplicationForm from "@/components/forms/client/spes-application-form";
import ApplicationProgress from "@/components/client/application-progress";
import { Card } from "@/ui/card";

const ApplicationForm = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Progress Sidebar */}
      <div className="lg:col-span-1">
        <ApplicationProgress />
      </div>

      {/* Form Content */}
      <div className="lg:col-span-3">
        <Card className="p-6">
          <SPESApplicationForm />
        </Card>
      </div>
    </div>
  );
};

export default ApplicationForm;
