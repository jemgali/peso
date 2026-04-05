import React from "react";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import Link from "next/link";
import { FileText, CheckCircle2, Clock } from "lucide-react";

const Page = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome to PESO System</h1>
        <p className="text-muted-foreground">
          Manage your SPES application and track your progress
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Active Applications
              </p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <FileText className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </Card>
      </div>

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
    </div>
  );
};

export default Page;
