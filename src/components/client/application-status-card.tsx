"use client";

import React from "react";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  ArrowRight,
} from "lucide-react";
import type { ApplicationStatus } from "@/lib/validations/application-review";

interface ApplicationStatusCardProps {
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  {
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
  }
> = {
  pending: {
    label: "Pending Review",
    description: "Your application is waiting to be reviewed by an administrator.",
    icon: <Clock className="h-6 w-6" />,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800",
  },
  in_review: {
    label: "Under Review",
    description: "An administrator is currently reviewing your application.",
    icon: <FileText className="h-6 w-6" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
  },
  approved: {
    label: "Approved",
    description: "Congratulations! Your SPES application has been approved.",
    icon: <CheckCircle2 className="h-6 w-6" />,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
  },
  needs_revision: {
    label: "Needs Revision",
    description: "Your application requires some changes. Please review the feedback and resubmit.",
    icon: <AlertTriangle className="h-6 w-6" />,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
  },
  rejected: {
    label: "Rejected",
    description: "Unfortunately, your application has been rejected.",
    icon: <XCircle className="h-6 w-6" />,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
  },
};

const ApplicationStatusCard: React.FC<ApplicationStatusCardProps> = ({
  status,
  submittedAt,
  updatedAt,
}) => {
  const config = STATUS_CONFIG[status];

  return (
    <Card className={`p-6 border ${config.bgColor}`}>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${config.bgColor} ${config.color}`}>
          {config.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-lg font-semibold ${config.color}`}>
              {config.label}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{config.description}</p>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span>Submitted: {new Date(submittedAt).toLocaleDateString()}</span>
            <span>Last Updated: {new Date(updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Action buttons based on status */}
      <div className="mt-4 pt-4 border-t flex flex-wrap gap-3">
        <Link href="/protected/client/application/status">
          <Button variant="outline" size="sm">
            View Details
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </Link>

        {status === "needs_revision" && (
          <Link href="/protected/client/application">
            <Button size="sm">
              Edit & Resubmit
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
};

export default ApplicationStatusCard;
