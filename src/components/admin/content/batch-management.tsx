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
import { BatchManagementSkeleton } from "@/components/ui/skeletons";
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
import { Building2Icon, LayersIcon, UsersIcon, Trash2Icon, Edit2Icon, CheckIcon, XIcon } from "lucide-react";
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
  MANILA_TIME_ZONE,
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

  const [editingBatchId, setEditingBatchId] = useState<string | null>(null);
  const [editBatchName, setEditBatchName] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [updatingBatch, setUpdatingBatch] = useState(false);
  const [deletingBatchId, setDeletingBatchId] = useState<string | null>(null);

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
          batchName: batchName.trim().toUpperCase(),
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

  const startEditingBatch = (batch: BatchListItem) => {
    setEditingBatchId(batch.batchId);
    setEditBatchName(batch.batchName);
    setEditStartDate(batch.startDate);
  };

  const cancelEditingBatch = () => {
    setEditingBatchId(null);
    setEditBatchName("");
    setEditStartDate("");
  };

  const updateBatch = async (batchId: string) => {
    if (!editBatchName.trim() || !editStartDate) return;
    setUpdatingBatch(true);

    try {
      const response = await fetch(`/api/admin/spes/batches/${batchId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchName: editBatchName.trim().toUpperCase(),
          startDate: editStartDate,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to update batch");
      }

      setBatches((current) =>
        current.map((b) =>
          b.batchId === batchId
            ? {
                ...b,
                batchName: payload.data.batch.batchName,
                startDate: new Date(payload.data.batch.startDate).toLocaleDateString("en-CA", { timeZone: MANILA_TIME_ZONE }),
                batchYear: payload.data.batch.batchYear,
              }
            : b
        )
      );
      toast.success("Batch updated");
      cancelEditingBatch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update batch");
    } finally {
      setUpdatingBatch(false);
    }
  };

  const deleteBatch = async (batchId: string) => {
    if (!confirm("Are you sure you want to delete this batch?")) return;
    setDeletingBatchId(batchId);

    try {
      const response = await fetch(`/api/admin/spes/batches/${batchId}`, {
        method: "DELETE",
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.error || "Failed to delete batch");
      }

      setBatches((current) => current.filter((b) => b.batchId !== batchId));
      if (selectedBatchId === batchId) setSelectedBatchId("");
      toast.success("Batch deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete batch");
    } finally {
      setDeletingBatchId(null);
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
    if (batchYearFilter === "all") return batches;
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
                  <NativeSelectOption value="all">All Batch</NativeSelectOption>
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
              <BatchManagementSkeleton />
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="batch-creation">Batch Creation</TabsTrigger>
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
                  <div className="mt-4 flex flex-col gap-3">
                    <h3 className="text-sm font-semibold">
                      Batches for {batchYearFilter} ({filteredBatches.length})
                    </h3>
                    {filteredBatches.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No batches found for this year.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {filteredBatches.map((batch) => (
                          <div key={batch.batchId} className="flex items-center justify-between rounded-lg border p-3 bg-card shadow-sm">
                            {editingBatchId === batch.batchId ? (
                              <div className="flex w-full items-center gap-3">
                                <Input
                                  value={editBatchName}
                                  onChange={(e) => setEditBatchName(e.target.value)}
                                  className="h-8 max-w-[200px]"
                                  placeholder="Batch Name"
                                />
                                <Input
                                  type="date"
                                  value={editStartDate}
                                  onChange={(e) => setEditStartDate(e.target.value)}
                                  className="h-8 max-w-[150px]"
                                />
                                <div className="flex items-center gap-1 ml-auto">
                                  <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="ghost"
                                    onClick={() => updateBatch(batch.batchId)}
                                    disabled={updatingBatch}
                                    title="Save"
                                  >
                                    {updatingBatch ? <Spinner /> : <CheckIcon className="text-green-500" />}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="ghost"
                                    onClick={cancelEditingBatch}
                                    disabled={updatingBatch}
                                    title="Cancel"
                                  >
                                    <XIcon className="text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex w-full items-center justify-between gap-3">
                                <div className="flex flex-col">
                                  <span className="font-medium text-sm">{batch.batchName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    Start: {(() => {
                                      const d = new Date(batch.startDate);
                                      const mm = String(d.getMonth() + 1).padStart(2, '0');
                                      const dd = String(d.getDate()).padStart(2, '0');
                                      const yyyy = d.getFullYear();
                                      return `${mm}/${dd}/${yyyy}`;
                                    })()} &middot; Grantees: {batch.granteeCount || 0}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="ghost"
                                    onClick={() => startEditingBatch(batch)}
                                    title="Edit Batch"
                                  >
                                    <Edit2Icon className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="icon-xs"
                                    variant="ghost"
                                    onClick={() => deleteBatch(batch.batchId)}
                                    disabled={deletingBatchId === batch.batchId || (batch.granteeCount || 0) > 0}
                                    title={(batch.granteeCount || 0) > 0 ? "Cannot delete batch with assigned grantees" : "Delete Batch"}
                                  >
                                    {deletingBatchId === batch.batchId ? <Spinner /> : <Trash2Icon className="h-4 w-4 text-destructive" />}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
