"use client";

import React, { useEffect, useState } from "react";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import Link from "next/link";
import { FileText, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { ApplicationStatusCard } from "@/components/client";
import type { ClientApplicationStatusResponse } from "@/lib/validations/application-review";

const Page = () => {
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<ClientApplicationStatusResponse["data"] | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/client/application/status");
        const data = await response.json();
        if (data.success) {
          setStatusData(data.data);
        }
      } catch (error) {
        console.error("Error fetching status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome to PESO System</h1>
        <p className="text-muted-foreground">
          Manage your SPES application and track your progress
        </p>
      </div>

      {/* Application Status */}
      {statusData?.hasApplication && statusData.submission && (
        <ApplicationStatusCard
          status={statusData.submission.status}
          submissionNumber={statusData.submission.submissionNumber}
          submittedAt={statusData.submission.submittedAt}
          updatedAt={statusData.submission.updatedAt}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Active Applications
              </p>
              <p className="text-3xl font-bold">
                {statusData?.hasApplication ? 1 : 0}
              </p>
            </div>
            <FileText className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-3xl font-bold capitalize">
                {statusData?.submission?.status?.replace("_", " ") || "None"}
              </p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Submissions</p>
              <p className="text-3xl font-bold">
                {statusData?.submission?.submissionNumber || 0}
              </p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Get Started Card - only show if no application */}
      {!statusData?.hasApplication && (
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Get Started</h2>
            <p className="text-muted-foreground">
              Start your SPES application process by filling out the application
              form below.
            </p>
            <Link href="/protected/client/application">
              <Button className="w-full md:w-auto">
                <FileText className="w-4 h-4 mr-2" />
                Start Application Form
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      {statusData?.hasApplication && statusData.submission?.status !== "approved" && (
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link href="/protected/client/application/status">
                <Button variant="outline">
                  View Application Status
                </Button>
              </Link>
              {statusData.submission?.status === "needs_revision" && (
                <Link href="/protected/client/application">
                  <Button>
                    <FileText className="w-4 h-4 mr-2" />
                    Edit & Resubmit
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Page;
