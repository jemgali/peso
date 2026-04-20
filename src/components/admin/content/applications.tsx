"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { ApplicationsListSkeleton } from "@/ui/skeletons";
import type {
  ApplicantType,
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

const APPLICANT_TYPE_LABELS: Record<ApplicantType, string> = {
  new: "New Applicant",
  spes_baby: "SPES Baby",
};

const APPLICANT_TYPE_COLORS: Record<ApplicantType, string> = {
  new: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  spes_baby: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

const STATUS_OPTIONS: ApplicationStatus[] = [
  "pending",
  "in_review",
  "approved",
  "needs_revision",
  "rejected",
];

const Applications = () => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>(String(currentYear));
  const [availableYears, setAvailableYears] = useState<number[]>([currentYear]);
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
          year: yearFilter,
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
          setAvailableYears(
            Array.isArray(data.data.availableYears) && data.data.availableYears.length > 0
              ? data.data.availableYears
              : [currentYear]
          );
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
  }, [statusFilter, page, searchQuery, yearFilter, currentYear]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const yearOptions = useMemo(() => {
    const uniqueYears = new Set(availableYears);
    uniqueYears.add(currentYear);
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [availableYears, currentYear]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Applications</h1>
        <p className="text-muted-foreground">Review and manage SPES applications</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </form>

          <Select
            value={yearFilter}
            onValueChange={(value) => {
              setYearFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year === currentYear ? `This Year (${year})` : String(year)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        {loading ? (
          <div className="p-6">
            <ApplicationsListSkeleton />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-red-500">{error}</div>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
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
                        className={APPLICANT_TYPE_COLORS[app.applicantType]}
                      >
                        {APPLICANT_TYPE_LABELS[app.applicantType]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={STATUS_COLORS[app.status]}>
                        {STATUS_LABELS[app.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(app.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => router.push(`/protected/admin/applications/${app.submissionId}`)}
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        {app.hasReview ? "Modify" : "Review"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of{" "}
                  {total} applications
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
