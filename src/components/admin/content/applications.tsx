"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Badge } from "@/ui/badge";
import { Card } from "@/ui/card";
import { Loader2, Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { ApplicationsListSkeleton } from "@/ui/skeletons";
import type {
  ApplicationListItem,
  ApplicationStatus,
} from "@/lib/validations/application-review";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  in_review: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  needs_revision: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Pending",
  in_review: "In Review",
  approved: "Approved",
  needs_revision: "Needs Revision",
  rejected: "Rejected",
};

const Applications = () => {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
        });

        if (statusFilter !== "all") {
          params.set("status", statusFilter);
        }

        if (searchQuery) {
          params.set("search", searchQuery);
        }

        const response = await fetch(`/api/admin/applications?${params}`);
        const data = await response.json();

        if (data.success) {
          setApplications(data.data.applications);
          setTotal(data.data.total);
        } else {
          setError(data.error || "Failed to fetch applications");
        }
      } catch {
        setError("An error occurred while fetching applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [statusFilter, page, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-muted-foreground">
          Review and manage SPES applications
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </form>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_review">In Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="needs_revision">Needs Revision</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Applications Table */}
      <Card>
        {loading ? (
          <div className="p-6">
            <ApplicationsListSkeleton />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-red-500">
            {error}
          </div>
        ) : applications.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            No applications found
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submission #</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.submissionId}>
                    <TableCell className="font-medium">
                      {app.applicant.lastName}, {app.applicant.firstName}
                    </TableCell>
                    <TableCell>{app.applicant.email}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={STATUS_COLORS[app.status]}
                      >
                        {STATUS_LABELS[app.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{app.submissionNumber}</TableCell>
                    <TableCell>
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/protected/admin/applications/${app.submissionId}`
                          )
                        }
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1} to{" "}
                  {Math.min(page * pageSize, total)} of {total} applications
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default Applications;