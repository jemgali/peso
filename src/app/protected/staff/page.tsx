import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardCheckIcon, FileWarningIcon, UsersIcon } from "lucide-react"

export default function StaffDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Staff Workspace</h1>
        <p className="text-muted-foreground">
          Welcome to the evaluation portal. You can review and score SPES applicants here.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Evaluations</CardTitle>
            <ClipboardCheckIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Applicants waiting for review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Remarks</CardTitle>
            <FileWarningIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Violations recorded this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Grantees</CardTitle>
            <UsersIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Active SPES beneficiaries</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>How to use the staff portal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            1. Go to the <strong>Evaluation</strong> tab to see the list of applicants assigned to your office.
          </p>
          <p>
            2. Click on an applicant to view their documents and perform the evaluation (Scoring & Remarks).
          </p>
          <p>
            3. Use the <strong>Remarks</strong> tab to record any violations or positive observations for active grantees.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
