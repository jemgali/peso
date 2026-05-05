"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Building2Icon, LayersIcon, UsersIcon } from "lucide-react";
import { ROUTES } from "@/lib/constants/routes";
import type {
  BatchListItem,
  BatchListResponse,
  BulkAssignWorkflowsResponse,
  CreateBatchResponse,
  SpesWorkflowListItem,
  SpesWorkflowListResponse,
  BulkNotifyWorkflowsResponse,
} from "@/lib/validations/spes-workflow";
import {
  formatDateTimeInputInManila,
  parseManilaDateInput,
  parseManilaDateTimeInput,
} from "@/lib/manila-datetime";

type LguOfficeSource = Record<string, string | string[]>;

function isPasser(workflow: SpesWorkflowListItem): boolean {
  return workflow.selectionStatus === "grantee";
}

function parseOfficeOptions(payload: unknown): string[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return [];
  }

  const source = payload as LguOfficeSource;
  const options = new Set<string>();

  for (const [office, divisionOrOffice] of Object.entries(source)) {
    if (typeof divisionOrOffice === "string") {
      const value = divisionOrOffice.trim();
      if (value) options.add(value);
      continue;
    }

    for (const division of divisionOrOffice) {
      const trimmedDivision = division.trim();
      if (!trimmedDivision) continue;
      options.add(`${office} / ${trimmedDivision}`);
    }
  }

  return Array.from(options).sort((a, b) => a.localeCompare(b));
}

export default function BatchManagement() {
  const [batches, setBatches] = useState<BatchListItem[]>([]);
  const [workflows, setWorkflows] = useState<SpesWorkflowListItem[]>([]);
  const [officeOptions, setOfficeOptions] = useState<string[]>([]);

  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingWorkflows, setLoadingWorkflows] = useState(true);
  const [loadingOfficeOptions, setLoadingOfficeOptions] = useState(true);
  const [savingBatch, setSavingBatch] = useState(false);
  const [removingFromBatch, setRemovingFromBatch] = useState(false);
  const [assigningOffice, setAssigningOffice] = useState(false);

  const [batchError, setBatchError] = useState<string | null>(null);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [officeError, setOfficeError] = useState<string | null>(null);

  const [batchName, setBatchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedBatchWorkflowIds, setSelectedBatchWorkflowIds] = useState<
    Set<string>
  >(new Set());
  const [selectedOffice, setSelectedOffice] = useState("");

  const currentYear = new Date().getFullYear().toString();
  const [batchYearFilter, setBatchYearFilter] = useState(currentYear);

  const [notifyingApplicants, setNotifyingApplicants] = useState(false);
  const [notificationNote, setNotificationNote] = useState("");
  const [attachSchedule, setAttachSchedule] = useState(false);
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDescription, setScheduleDescription] = useState("");
  const [scheduleAllDay, setScheduleAllDay] = useState(false);
  const [scheduleStartDate, setScheduleStartDate] = useState(
    formatDateTimeInputInManila(new Date())
  );
  const [scheduleEndDate, setScheduleEndDate] = useState("");

  const loadBatches = useCallback(async () => {
    setLoadingBatches(true);
    setBatchError(null);

    try {
      const response = await fetch(ROUTES.API.ADMIN.SPES.BATCHES, {
        cache: "no-store",
      });
      const payload = (await response.json()) as BatchListResponse;
      const fetchedBatches = payload.data?.batches;

      if (!response.ok || !payload.success || !fetchedBatches) {
        throw new Error(payload.error || "Failed to load batches");
      }

      setBatches(fetchedBatches);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load batches";
      setBatchError(message);
      toast.error(message);
    } finally {
      setLoadingBatches(false);
    }
  }, []);

  const loadWorkflows = useCallback(async () => {
    setLoadingWorkflows(true);
    setWorkflowError(null);

    try {
      const response = await fetch(ROUTES.API.ADMIN.SPES.WORKFLOWS, {
        cache: "no-store",
      });
      const payload = (await response.json()) as SpesWorkflowListResponse;
      const fetchedWorkflows = payload.data?.workflows;

      if (!response.ok || !payload.success || !fetchedWorkflows) {
        throw new Error(payload.error || "Failed to load workflows");
      }

      setWorkflows(fetchedWorkflows);
      setSelectedBatchWorkflowIds((current) => {
        const valid = new Set(
          fetchedWorkflows.map((workflow) => workflow.workflowId),
        );
        return new Set(Array.from(current).filter((id) => valid.has(id)));
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load workflows";
      setWorkflowError(message);
      toast.error(message);
    } finally {
      setLoadingWorkflows(false);
    }
  }, []);

  const loadOfficeOptions = useCallback(async () => {
    setLoadingOfficeOptions(true);
    setOfficeError(null);

    try {
      const response = await fetch("/data/lgu-list.json", {
        cache: "force-cache",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error("Failed to load office list");
      }

      const options = parseOfficeOptions(payload);
      setOfficeOptions(options);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load office list";
      setOfficeError(message);
      toast.error(message);
    } finally {
      setLoadingOfficeOptions(false);
    }
  }, []);

  useEffect(() => {
    void loadBatches();
    void loadWorkflows();
    void loadOfficeOptions();
  }, [loadBatches, loadWorkflows, loadOfficeOptions]);

  useEffect(() => {
    if (batches.length === 0) {
      setSelectedBatchId("");
      return;
    }

    const hasSelectedBatch = batches.some(
      (batch) => batch.batchId === selectedBatchId,
    );
    if (!hasSelectedBatch) {
      setSelectedBatchId(batches[0]?.batchId || "");
    }
  }, [batches, selectedBatchId]);

  useEffect(() => {
    setSelectedBatchWorkflowIds(new Set());
  }, [selectedBatchId]);

  const submitBatch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingBatch(true);

    try {
      const response = await fetch(ROUTES.API.ADMIN.SPES.BATCHES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchName,
          startDate,
          batchYear: parseInt(startDate.split("-")[0] || "0", 10),
        }),
      });
      const payload = (await response.json()) as CreateBatchResponse;
      const createdBatch = payload.data?.batch;

      if (!response.ok || !payload.success || !createdBatch) {
        throw new Error(payload.error || "Failed to create batch");
      }

      setBatches((current) => [createdBatch, ...current]);
      setSelectedBatchId(createdBatch.batchId);
      setBatchName("");
      setStartDate("");
      toast.success("Batch created");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create batch",
      );
    } finally {
      setSavingBatch(false);
    }
  };

  const notifySelectedApplicants = async () => {
    const targetWorkflowIds = Array.from(selectedBatchWorkflowIds);
    if (targetWorkflowIds.length === 0) {
      toast.error("Select at least one applicant from the batch");
      return;
    }

    let schedulePayload:
      | {
          title: string;
          description?: string;
          startDate: string;
          endDate?: string | null;
          allDay: boolean;
        }
      | undefined;

    if (attachSchedule) {
      const trimmedScheduleTitle = scheduleTitle.trim();
      if (!trimmedScheduleTitle) {
        toast.error(
          "Schedule title is required when calendar scheduling is enabled",
        );
        return;
      }

      if (!scheduleStartDate) {
        toast.error("Schedule start date is required");
        return;
      }

      const startDateInputValue = scheduleAllDay
        ? scheduleStartDate.split("T")[0] || scheduleStartDate
        : scheduleStartDate;
      const parsedStartDate = scheduleAllDay
        ? parseManilaDateInput(startDateInputValue)
        : parseManilaDateTimeInput(scheduleStartDate);
      if (!parsedStartDate) {
        toast.error("Schedule start date is invalid");
        return;
      }

      let parsedEndDate: Date | null = null;
      if (scheduleEndDate) {
        const endDateInputValue = scheduleAllDay
          ? scheduleEndDate.split("T")[0] || scheduleEndDate
          : scheduleEndDate;
        parsedEndDate = scheduleAllDay
          ? parseManilaDateInput(endDateInputValue)
          : parseManilaDateTimeInput(scheduleEndDate);
        if (!parsedEndDate) {
          toast.error("Schedule end date is invalid");
          return;
        }

        if (parsedEndDate.getTime() < parsedStartDate.getTime()) {
          toast.error("Schedule end date must be after or equal to start date");
          return;
        }
      }

      schedulePayload = {
        title: trimmedScheduleTitle,
        description: scheduleDescription.trim() || undefined,
        startDate: parsedStartDate.toISOString(),
        endDate: parsedEndDate ? parsedEndDate.toISOString() : null,
        allDay: scheduleAllDay,
      };
    }

    setNotifyingApplicants(true);
    try {
      const response = await fetch(ROUTES.API.ADMIN.SPES.WORKFLOWS_NOTIFY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowIds: targetWorkflowIds,
          note: notificationNote.trim() || undefined,
          schedule: schedulePayload,
        }),
      });
      const payload = (await response.json()) as BulkNotifyWorkflowsResponse;
      const result = payload.data;

      if (!response.ok || !payload.success || !result) {
        throw new Error(payload.error || "Failed to notify selected applicants");
      }

      toast.success(
        `Notified ${result.notified} applicant${
          result.notified === 1 ? "" : "s"
        } (${result.emailSent} email${result.emailSent === 1 ? "" : "s"} sent).`,
      );
      if (result.scheduledEvent) {
        toast.success(
          `Scheduled "${result.scheduledEvent.title}" for ${
            result.scheduledEvent.recipientCount
          } selected applicant${
            result.scheduledEvent.recipientCount === 1 ? "" : "s"
          }.`,
        );
      }
      if (result.missingWorkflowIds.length > 0) {
        toast.info(
          `${result.missingWorkflowIds.length} selected record${
            result.missingWorkflowIds.length === 1 ? " was" : "s were"
          } skipped because they were unavailable.`,
        );
      }

      setSelectedBatchWorkflowIds(new Set());
      setNotificationNote("");
      setAttachSchedule(false);
      setScheduleTitle("");
      setScheduleDescription("");
      setScheduleAllDay(false);
      setScheduleStartDate(formatDateTimeInputInManila(new Date()));
      setScheduleEndDate("");
      await loadWorkflows();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to notify selected applicants",
      );
    } finally {
      setNotifyingApplicants(false);
    }
  };

  const removeSelectedGranteesFromBatch = async () => {
    const workflowIds = Array.from(selectedBatchWorkflowIds);
    if (!selectedBatchId) {
      toast.error("Select current batch first");
      return;
    }
    if (workflowIds.length === 0) {
      toast.error("Select at least one grantee from the current batch");
      return;
    }

    setRemovingFromBatch(true);
    try {
      const response = await fetch(
        ROUTES.API.ADMIN.SPES.WORKFLOWS_BULK_ASSIGNMENT,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workflowIds,
            batchId: null,
          }),
        },
      );
      const payload = (await response.json()) as BulkAssignWorkflowsResponse;
      const result = payload.data;

      if (!response.ok || !payload.success || !result) {
        throw new Error(
          payload.error || "Failed to remove selected grantees from batch",
        );
      }

      toast.success(
        `Removed ${result.updated} grantee${result.updated === 1 ? "" : "s"} from current batch.`,
      );
      if (result.updated > 0) {
        toast.info("Office assignment cleared for removed grantees.");
      }
      if (result.missingWorkflowIds.length > 0) {
        toast.info(
          `${result.missingWorkflowIds.length} selected record${
            result.missingWorkflowIds.length === 1 ? " was" : "s were"
          } skipped because they were unavailable.`,
        );
      }

      setSelectedBatchWorkflowIds(new Set());
      await Promise.all([loadWorkflows(), loadBatches()]);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to remove selected grantees from batch",
      );
    } finally {
      setRemovingFromBatch(false);
    }
  };

  const assignOfficeToSelected = async () => {
    const workflowIds = Array.from(selectedBatchWorkflowIds);
    if (!selectedBatchId) {
      toast.error("Select a batch first");
      return;
    }
    if (workflowIds.length === 0) {
      toast.error("Select at least one grantee from the batch list");
      return;
    }
    if (!selectedOffice) {
      toast.error("Select an office assignment");
      return;
    }

    setAssigningOffice(true);
    try {
      const response = await fetch(
        ROUTES.API.ADMIN.SPES.WORKFLOWS_BULK_ASSIGNMENT,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workflowIds,
            assignedOffice: selectedOffice,
          }),
        },
      );
      const payload = (await response.json()) as BulkAssignWorkflowsResponse;
      const result = payload.data;

      if (!response.ok || !payload.success || !result) {
        throw new Error(
          payload.error || "Failed to assign office to selected grantees",
        );
      }

      toast.success(
        `Assigned office to ${result.updated} grantee${result.updated === 1 ? "" : "s"}.`,
      );
      if (result.missingWorkflowIds.length > 0) {
        toast.info(
          `${result.missingWorkflowIds.length} selected record${
            result.missingWorkflowIds.length === 1 ? " was" : "s were"
          } skipped because they were unavailable.`,
        );
      }

      setSelectedBatchWorkflowIds(new Set());
      await loadWorkflows();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to assign office",
      );
    } finally {
      setAssigningOffice(false);
    }
  };

  const selectedBatch = useMemo(
    () => batches.find((batch) => batch.batchId === selectedBatchId) || null,
    [batches, selectedBatchId],
  );

  const batchMembers = useMemo(
    () =>
      workflows.filter(
        (workflow) =>
          workflow.batchId === selectedBatchId && isPasser(workflow),
      ),
    [workflows, selectedBatchId],
  );

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => batch.batchYear.toString() === batchYearFilter);
  }, [batches, batchYearFilter]);

  const allBatchMembersSelected =
    batchMembers.length > 0 &&
    batchMembers.every((workflow) =>
      selectedBatchWorkflowIds.has(workflow.workflowId),
    );

  const toggleBatchWorkflowSelection = (
    workflowId: string,
    checked: boolean,
  ) => {
    setSelectedBatchWorkflowIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(workflowId);
      } else {
        next.delete(workflowId);
      }
      return next;
    });
  };

  const toggleAllBatchWorkflowSelections = (checked: boolean) => {
    setSelectedBatchWorkflowIds((current) => {
      if (!checked) {
        const next = new Set(current);
        for (const workflow of batchMembers) {
          next.delete(workflow.workflowId);
        }
        return next;
      }

      const next = new Set(current);
      for (const workflow of batchMembers) {
        next.add(workflow.workflowId);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Batch Management</h1>
        <p className="text-muted-foreground">
          Manage SPES batches, assign grantees to batches, and apply office
          assignments.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Batch Grantee Records</CardTitle>
            <CardDescription>
              Select a batch, review grantees assigned to it, and use right-side
              tabs for creation and controls.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div className="flex w-full max-w-70 flex-col gap-2">
                <Label htmlFor="batchYearFilter">Year Filter</Label>
                <NativeSelect
                  id="batchYearFilter"
                  value={batchYearFilter}
                  onChange={(event) => setBatchYearFilter(event.target.value)}
                >
                  <NativeSelectOption value={(new Date().getFullYear() - 1).toString()}>{new Date().getFullYear() - 1}</NativeSelectOption>
                  <NativeSelectOption value={(new Date().getFullYear()).toString()}>{new Date().getFullYear()}</NativeSelectOption>
                  <NativeSelectOption value={(new Date().getFullYear() + 1).toString()}>{new Date().getFullYear() + 1}</NativeSelectOption>
                </NativeSelect>
              </div>

              <div className="flex w-full max-w-70 flex-col gap-2">
                <Label htmlFor="batchSelect">Batch</Label>
                <NativeSelect
                  id="batchSelect"
                  value={selectedBatchId}
                  onChange={(event) => setSelectedBatchId(event.target.value)}
                  disabled={loadingBatches || filteredBatches.length === 0}
                >
                  {filteredBatches.length === 0 ? (
                    <NativeSelectOption value="">
                      No batches available for {batchYearFilter}
                    </NativeSelectOption>
                  ) : (
                    filteredBatches.map((batch) => (
                      <NativeSelectOption
                        key={batch.batchId}
                        value={batch.batchId}
                      >
                        {batch.batchName}
                      </NativeSelectOption>
                    ))
                  )}
                </NativeSelect>
              </div>

              <div className="flex flex-wrap items-center gap-2">

                <Button
                  type="button"
                  variant="outline"
                  onClick={removeSelectedGranteesFromBatch}
                  disabled={
                    removingFromBatch || selectedBatchWorkflowIds.size === 0
                  }
                >
                  {removingFromBatch && <Spinner data-icon="inline-start" />}
                  Remove Selected
                </Button>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <Badge variant="outline">
                Selected grantees: {selectedBatchWorkflowIds.size}
              </Badge>
              {selectedBatch && (
                <Badge variant="secondary">
                  Current batch: {selectedBatch.batchName}
                </Badge>
              )}
            </div>

            {loadingBatches || loadingWorkflows ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner data-icon="inline-start" />
                Loading batch records...
              </div>
            ) : batchError || workflowError ? (
              <p className="text-sm text-destructive">
                {batchError || workflowError}
              </p>
            ) : !selectedBatchId ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <LayersIcon />
                  </EmptyMedia>
                  <EmptyTitle>No batch selected</EmptyTitle>
                  <EmptyDescription>
                    Create or select a batch to view assigned grantees.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : batchMembers.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <UsersIcon />
                  </EmptyMedia>
                  <EmptyTitle>No grantees in this batch</EmptyTitle>
                  <EmptyDescription>
                    Select grantees from the Grantees tab, then use the button
                    above to add them to this batch.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allBatchMembersSelected}
                        onCheckedChange={(checked) =>
                          toggleAllBatchWorkflowSelections(checked === true)
                        }
                      />
                    </TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Office Assignment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchMembers.map((workflow) => (
                    <TableRow key={workflow.workflowId}>
                      <TableCell>
                        <Checkbox
                          checked={selectedBatchWorkflowIds.has(
                            workflow.workflowId,
                          )}
                          onCheckedChange={(checked) =>
                            toggleBatchWorkflowSelection(
                              workflow.workflowId,
                              checked === true,
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {workflow.applicantName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {workflow.assignedOffice || "Unassigned"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="batch-creation" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="batch-creation">Batch Creation</TabsTrigger>
            <TabsTrigger value="notify">Notify</TabsTrigger>
            <TabsTrigger value="office-assignment">
              Office Assignment
            </TabsTrigger>
          </TabsList>

          <TabsContent value="batch-creation" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Create Batch</CardTitle>
                <CardDescription>
                  Create new SPES batches and set start dates.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <form onSubmit={submitBatch} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="batchName">Batch Name</Label>
                    <Input
                      id="batchName"
                      placeholder="e.g., SPES 2026 Batch A"
                      value={batchName}
                      onChange={(event) => setBatchName(event.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="batchStartDate">Start Date</Label>
                    <Input
                      id="batchStartDate"
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={savingBatch}>
                    {savingBatch && <Spinner data-icon="inline-start" />}
                    Create Batch
                  </Button>
                </form>

                {loadingBatches ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner data-icon="inline-start" />
                    Loading existing batches...
                  </div>
                ) : batchError ? (
                  <p className="text-sm text-destructive">{batchError}</p>
                ) : batches.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No batches yet.
                  </p>
                ) : (
                  <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                    Total batches:{" "}
                    <span className="font-medium text-foreground">
                      {batches.length}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notify" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Notify</CardTitle>
                <CardDescription>
                  Send an email notification and schedule a calendar event for the selected applicants.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="notificationNote">Notification Note (optional)</Label>
                  <Textarea
                    id="notificationNote"
                    value={notificationNote}
                    onChange={(event) => setNotificationNote(event.target.value)}
                    placeholder="Additional context included in the notification email..."
                  />
                </div>

                <div className="rounded-lg border p-4 shadow-sm">
                  <div className="mb-4 flex items-start gap-2">
                    <Checkbox
                      id="attachSchedule"
                      checked={attachSchedule}
                      onCheckedChange={(checked) => setAttachSchedule(checked === true)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="attachSchedule" className="cursor-pointer">
                        Add calendar event for selected applicants
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Include a schedule event in the notification email.
                      </p>
                    </div>
                  </div>

                  {attachSchedule && (
                    <div className="space-y-3 rounded-lg bg-muted/30 p-3">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="notifyScheduleTitle">Schedule Title</Label>
                        <NativeSelect
                          id="notifyScheduleTitle"
                          value={scheduleTitle}
                          onChange={(event) => setScheduleTitle(event.target.value)}
                        >
                          <NativeSelectOption value="">Select Title</NativeSelectOption>
                          <NativeSelectOption value="Orientation">Orientation</NativeSelectOption>
                          <NativeSelectOption value="Deployment">Deployment</NativeSelectOption>
                          <NativeSelectOption value="Others">Others</NativeSelectOption>
                        </NativeSelect>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label htmlFor="notifyScheduleDescription">Schedule Description (optional)</Label>
                        <Textarea
                          id="notifyScheduleDescription"
                          value={scheduleDescription}
                          onChange={(event) => setScheduleDescription(event.target.value)}
                          placeholder="Optional details about this scheduled event"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="notifyScheduleAllDay"
                          checked={scheduleAllDay}
                          onCheckedChange={(checked) => setScheduleAllDay(checked === true)}
                        />
                        <Label htmlFor="notifyScheduleAllDay" className="cursor-pointer">
                          All-day event
                        </Label>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="notifyScheduleStart">
                            {scheduleAllDay ? "Start Date" : "Start Date & Time"}
                          </Label>
                          <Input
                            id="notifyScheduleStart"
                            type={scheduleAllDay ? "date" : "datetime-local"}
                            value={scheduleAllDay ? scheduleStartDate.split("T")[0] || "" : scheduleStartDate}
                            onChange={(event) => setScheduleStartDate(event.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="notifyScheduleEnd">
                            {scheduleAllDay ? "End Date (optional)" : "End Date & Time (optional)"}
                          </Label>
                          <Input
                            id="notifyScheduleEnd"
                            type={scheduleAllDay ? "date" : "datetime-local"}
                            value={scheduleAllDay ? scheduleEndDate.split("T")[0] || "" : scheduleEndDate}
                            onChange={(event) => setScheduleEndDate(event.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
                  Selected applicants: <span className="font-medium text-foreground">{selectedBatchWorkflowIds.size}</span>
                </div>

                <Button
                  type="button"
                  onClick={notifySelectedApplicants}
                  disabled={notifyingApplicants || selectedBatchWorkflowIds.size === 0}
                >
                  {notifyingApplicants && <Spinner data-icon="inline-start" />}
                  Send Notification
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="office-assignment" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Office Assignment</CardTitle>
                <CardDescription>
                  Select grantees from left table, then assign office in one
                  action using LGU office list.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                  Batch:{" "}
                  <span className="font-medium text-foreground">
                    {selectedBatch?.batchName || "None"}
                  </span>
                  <br />
                  Selected grantees:{" "}
                  <span className="font-medium text-foreground">
                    {selectedBatchWorkflowIds.size}
                  </span>
                </div>

                {loadingOfficeOptions ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner data-icon="inline-start" />
                    Loading office options...
                  </div>
                ) : officeError ? (
                  <p className="text-sm text-destructive">{officeError}</p>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="officeOption">Office Assignment</Label>
                      <NativeSelect
                        id="officeOption"
                        value={selectedOffice}
                        onChange={(event) =>
                          setSelectedOffice(event.target.value)
                        }
                      >
                        <NativeSelectOption value="">
                          Select office
                        </NativeSelectOption>
                        {officeOptions.map((office) => (
                          <NativeSelectOption key={office} value={office}>
                            {office}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </div>

                    <Button
                      type="button"
                      onClick={assignOfficeToSelected}
                      disabled={
                        assigningOffice ||
                        selectedBatchWorkflowIds.size === 0 ||
                        !selectedOffice
                      }
                    >
                      {assigningOffice && <Spinner data-icon="inline-start" />}
                      <Building2Icon />
                      Assign Office to Selected Grantees
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
