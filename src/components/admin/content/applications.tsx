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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Badge } from "@/ui/badge";
import { Card, CardContent } from "@/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/ui/empty";
import { Search, Eye, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, FileText } from "lucide-react";
import { ApplicationsListSkeleton } from "@/ui/skeletons";
import { PageHeader } from "@/components/shared";
import ApplicationPeriodSettings from "@/components/admin/content/application-period-settings";
import type {
  ApplicantType,
  ApplicationListItem,
  ApplicationStatus,
} from "@/lib/validations/application-review";

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "Pending",
  in_review: "In Review",
  approved: "Approved",
  needs_revision: "Needs Revision",
  rejected: "Rejected",
};

const STATUS_BADGE_VARIANT: Record<ApplicationStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  in_review: "secondary",
  approved: "default",
  needs_revision: "outline",
  rejected: "destructive",
};

const APPLICANT_TYPE_LABELS: Record<ApplicantType, string> = {
  new: "New Applicant",
  spes_baby: "SPES Baby",
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
  const [expandedAvailmentSubmissionId, setExpandedAvailmentSubmissionId] = useState<string | null>(null);
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
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Applications"
        description="Review and manage SPES applications"
      />

      {/* Application Period Toggle */}
      <ApplicationPeriodSettings />

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
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
                <SelectGroup>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year === currentYear ? `This Year (${year})` : String(year)}
                    </SelectItem>
                  ))}
                </SelectGroup>
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
                <SelectGroup>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        {loading ? (
          <CardContent>
            <ApplicationsListSkeleton />
          </CardContent>
        ) : error ? (
          <CardContent className="flex items-center justify-center py-12 text-destructive">
            {error}
          </CardContent>
        ) : applications.length === 0 ? (
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileText />
                </EmptyMedia>
                <EmptyTitle>No applications found</EmptyTitle>
                <EmptyDescription>
                  Try adjusting your filters or search query.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Years of Availment</TableHead>
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
                      <Badge variant={app.applicantType === "spes_baby" ? "secondary" : "outline"}>
                        {APPLICANT_TYPE_LABELS[app.applicantType]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {app.availmentYears.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setExpandedAvailmentSubmissionId((current) =>
                                current === app.submissionId ? null : app.submissionId,
                              )
                            }
                          >
                            View History
                            {expandedAvailmentSubmissionId === app.submissionId ? (
                              <ChevronUp data-icon="inline-end" />
                            ) : (
                              <ChevronDown data-icon="inline-end" />
                            )}
                          </Button>
                          {expandedAvailmentSubmissionId === app.submissionId && (
                            <div className="rounded-md border bg-background p-2 text-xs shadow-sm">
                              {app.availmentYears.map((year) => (
                                <div key={year}>{year}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={STATUS_BADGE_VARIANT[app.status]}>
                          {STATUS_LABELS[app.status]}
                        </Badge>
                        {app.resubmittedAfterRevision && (
                          <Badge variant="outline">
                            Resubmitted
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(app.submittedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => router.push(`/protected/admin/applications/${app.submissionId}`)}
                      >
                        <Eye data-icon="inline-start" />
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
                    <ChevronLeft />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight />
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
