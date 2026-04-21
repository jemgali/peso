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
} from "@/lib/validations/spes-workflow";

type LguOfficeSource = Record<string, string | string[]>;

function isPasser(workflow: SpesWorkflowListItem): boolean {
  return (
    workflow.selectionStatus === "grantee" || workflow.examResult === "passed"
  );
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
  const [addingToBatch, setAddingToBatch] = useState(false);
  const [removingFromBatch, setRemovingFromBatch] = useState(false);
  const [assigningOffice, setAssigningOffice] = useState(false);

  const [batchError, setBatchError] = useState<string | null>(null);
  const [workflowError, setWorkflowError] = useState<string | null>(null);
  const [officeError, setOfficeError] = useState<string | null>(null);

  const [batchName, setBatchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedGranteeIds, setSelectedGranteeIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedBatchWorkflowIds, setSelectedBatchWorkflowIds] = useState<
    Set<string>
  >(new Set());
  const [selectedOffice, setSelectedOffice] = useState("");
  const [granteeSearch, setGranteeSearch] = useState("");

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
      setSelectedGranteeIds((current) => {
        const valid = new Set(
          fetchedWorkflows.map((workflow) => workflow.workflowId),
        );
        return new Set(Array.from(current).filter((id) => valid.has(id)));
      });
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
    setSelectedGranteeIds(new Set());
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

  const addSelectedGranteesToBatch = async () => {
    const workflowIds = Array.from(selectedGranteeIds);
    if (!selectedBatchId) {
      toast.error("Select a target batch first");
      return;
    }
    if (workflowIds.length === 0) {
      toast.error("Select at least one grantee from the Grantees tab");
      return;
    }

    setAddingToBatch(true);
    try {
      const response = await fetch(
        ROUTES.API.ADMIN.SPES.WORKFLOWS_BULK_ASSIGNMENT,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workflowIds,
            batchId: selectedBatchId,
          }),
        },
      );
      const payload = (await response.json()) as BulkAssignWorkflowsResponse;
      const result = payload.data;

      if (!response.ok || !payload.success || !result) {
        throw new Error(
          payload.error || "Failed to add selected grantees to batch",
        );
      }

      toast.success(
        `Added ${result.updated} grantee${result.updated === 1 ? "" : "s"} to selected batch.`,
      );
      if (result.missingWorkflowIds.length > 0) {
        toast.info(
          `${result.missingWorkflowIds.length} selected record${
            result.missingWorkflowIds.length === 1 ? " was" : "s were"
          } skipped because they were unavailable.`,
        );
      }

      setSelectedGranteeIds(new Set());
      await Promise.all([loadWorkflows(), loadBatches()]);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to add selected grantees to batch",
      );
    } finally {
      setAddingToBatch(false);
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

  const filteredGrantees = useMemo(() => {
    const search = granteeSearch.trim().toLowerCase();
    return workflows.filter((workflow) => {
      if (!isPasser(workflow)) return false;
      if (selectedBatchId && workflow.batchId === selectedBatchId) return false;
      if (!search) return true;
      return workflow.applicantName.toLowerCase().includes(search);
    });
  }, [workflows, granteeSearch, selectedBatchId]);

  const allGranteesSelected =
    filteredGrantees.length > 0 &&
    filteredGrantees.every((workflow) =>
      selectedGranteeIds.has(workflow.workflowId),
    );

  const allBatchMembersSelected =
    batchMembers.length > 0 &&
    batchMembers.every((workflow) =>
      selectedBatchWorkflowIds.has(workflow.workflowId),
    );

  const toggleGranteeSelection = (workflowId: string, checked: boolean) => {
    setSelectedGranteeIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(workflowId);
      } else {
        next.delete(workflowId);
      }
      return next;
    });
  };

  const toggleAllGranteeSelections = (checked: boolean) => {
    setSelectedGranteeIds((current) => {
      if (!checked) {
        const next = new Set(current);
        for (const workflow of filteredGrantees) {
          next.delete(workflow.workflowId);
        }
        return next;
      }

      const next = new Set(current);
      for (const workflow of filteredGrantees) {
        next.add(workflow.workflowId);
      }
      return next;
    });
  };

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
                <Label htmlFor="batchSelect">Batch</Label>
                <NativeSelect
                  id="batchSelect"
                  value={selectedBatchId}
                  onChange={(event) => setSelectedBatchId(event.target.value)}
                  disabled={loadingBatches || batches.length === 0}
                >
                  {batches.length === 0 ? (
                    <NativeSelectOption value="">
                      No batches available
                    </NativeSelectOption>
                  ) : (
                    batches.map((batch) => (
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
                  onClick={addSelectedGranteesToBatch}
                  disabled={
                    addingToBatch ||
                    !selectedBatchId ||
                    selectedGranteeIds.size === 0
                  }
                >
                  {addingToBatch && <Spinner data-icon="inline-start" />}
                  Add Selected
                </Button>

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
            <TabsTrigger value="grantees">Grantees</TabsTrigger>
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

          <TabsContent value="grantees" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Grantees</CardTitle>
                <CardDescription>
                  Select grantees here. Then use left-side button to add
                  selected grantees to chosen batch.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Input
                  placeholder="Search grantee name..."
                  value={granteeSearch}
                  onChange={(event) => setGranteeSearch(event.target.value)}
                />
                <div className="rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  Selected grantees:{" "}
                  <span className="font-medium text-foreground">
                    {selectedGranteeIds.size}
                  </span>
                </div>

                {loadingWorkflows ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner data-icon="inline-start" />
                    Loading grantees...
                  </div>
                ) : workflowError ? (
                  <p className="text-sm text-destructive">{workflowError}</p>
                ) : filteredGrantees.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <UsersIcon />
                      </EmptyMedia>
                      <EmptyTitle>No grantees found</EmptyTitle>
                      <EmptyDescription>
                        Adjust search or wait for more qualified records.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">
                          <Checkbox
                            checked={allGranteesSelected}
                            onCheckedChange={(checked) =>
                              toggleAllGranteeSelections(checked === true)
                            }
                          />
                        </TableHead>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Current Batch</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGrantees.map((workflow) => (
                        <TableRow key={workflow.workflowId}>
                          <TableCell>
                            <Checkbox
                              checked={selectedGranteeIds.has(
                                workflow.workflowId,
                              )}
                              onCheckedChange={(checked) =>
                                toggleGranteeSelection(
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
                            {workflow.batchName || "Unassigned"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
