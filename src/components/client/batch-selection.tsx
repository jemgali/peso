"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { toast } from "sonner"

interface BatchOption {
  batchId: string
  batchName: string
  startDate: string
  memberCount: number
}

export default function BatchSelection() {
  const [loading, setLoading] = useState(true)
  const [batches, setBatches] = useState<BatchOption[]>([])
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null)
  const [selectedBatchId, setSelectedBatchId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/client/spes/batch")
      if (res.status === 404 || res.status === 403) {
        // Not applicable for this user right now
        setLoading(false)
        return
      }

      const payload = await res.json()
      if (!res.ok || !payload.success) {
        throw new Error(payload.error || "Failed to load batches")
      }

      setBatches(payload.data.availableBatches || [])
      setCurrentBatchId(payload.data.currentBatchId)
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : "Failed to load batches")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const submitSelection = async () => {
    if (!selectedBatchId) {
      toast.error("Please select a batch first.")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/client/spes/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId: selectedBatchId })
      })

      const payload = await res.json()
      if (!res.ok || !payload.success) {
        throw new Error(payload.error || "Failed to select batch")
      }

      toast.success("Batch successfully assigned.")
      setCurrentBatchId(payload.data.batchId)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to assign batch")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Spinner />
        </CardContent>
      </Card>
    )
  }

  // If there are no batches returned and we are not loading, show a message to grantees.
  if (batches.length === 0 && !currentBatchId) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Batch Selection</CardTitle>
          <CardDescription>
            No batches are available for selection yet. You will be notified when batches are created by the admin.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }



  const assignedBatch = currentBatchId ? batches.find((b) => b.batchId === currentBatchId) : null

  if (currentBatchId && !isEditing) {
    return (
      <Card className="border-primary/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Batch Assignment</CardTitle>
            <CardDescription>You have been assigned to a batch for the SPES program.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => {
            setSelectedBatchId(currentBatchId)
            setIsEditing(true)
          }}>
            Edit Batch
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/40 p-4 border border-primary/20">
            <h3 className="font-semibold text-lg">{assignedBatch?.batchName || "Assigned Batch"}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start Date: {assignedBatch ? new Date(assignedBatch.startDate).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setSelectedBatchId("")
  }

  const handleSave = async () => {
    await submitSelection()
    setIsEditing(false)
  }

  return (
    <Card className="border-primary/50 shadow-md">
      <CardHeader>
        <CardTitle className="text-primary">Select Your Batch</CardTitle>
        <CardDescription>
          Congratulations on becoming a SPES Grantee! Please select the batch you prefer to join for this year.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <NativeSelect value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)}>
            <NativeSelectOption value="">-- Select a Batch --</NativeSelectOption>
            {batches.map((b) => (
              <NativeSelectOption key={b.batchId} value={b.batchId}>
                {b.batchName} (Starts: {new Date(b.startDate).toLocaleDateString()})
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {isEditing ? (
          <>
            <Button onClick={handleSave} disabled={submitting || !selectedBatchId || selectedBatchId === currentBatchId}>
              {submitting && <Spinner data-icon="inline-start" />}
              Save Changes
            </Button>
            <Button variant="ghost" onClick={handleCancelEdit} disabled={submitting}>
              Cancel
            </Button>
          </>
        ) : (
          <Button onClick={submitSelection} disabled={submitting || !selectedBatchId}>
            {submitting && <Spinner data-icon="inline-start" />}
            Confirm Batch Selection
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
