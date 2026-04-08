"use client"

import { Plus, Search, GripVertical, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import { Badge } from "@/ui/badge"
import { ProgramsListSkeleton } from "@/ui/skeletons"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table"
import { ProgramCreateDialog } from "./program-create-dialog"
import { ProgramEditDialog } from "./program-edit-dialog"
import { ProgramDeleteDialog } from "./program-delete-dialog"
import { type ProgramData } from "@/lib/validations/program"
import { useDialogState, useDataList } from "@/hooks"

export default function Programs() {
  const {
    createOpen,
    setCreateOpen,
    editOpen,
    setEditOpen,
    deleteOpen,
    setDeleteOpen,
    selectedItem: selectedProgram,
    openCreate,
    openEdit,
    openDelete,
    closeAll,
  } = useDialogState<ProgramData>()

  const {
    setItems,
    isLoading,
    searchQuery,
    setSearchQuery,
    filteredItems: filteredPrograms,
    paginatedItems: paginatedPrograms,
    currentPage,
    setCurrentPage,
    totalPages,
    startIndex,
    endIndex,
  } = useDataList<ProgramData>("/api/admin/programs", {
    searchKeys: ["title", "description"],
    pageSize: 10,
  })

  const handleProgramCreated = (newProgram: ProgramData) => {
    setItems((prev) => [...prev, newProgram].sort((a, b) => a.order - b.order))
    setCreateOpen(false)
  }

  const handleProgramUpdated = (updatedProgram: ProgramData) => {
    setItems((prev) =>
      prev.map((program) => (program.id === updatedProgram.id ? updatedProgram : program))
        .sort((a, b) => a.order - b.order)
    )
    closeAll()
  }

  const handleProgramDeleted = (deletedProgramId: string) => {
    setItems((prev) => prev.filter((program) => program.id !== deletedProgramId))
    closeAll()
  }

  if (isLoading) {
    return <ProgramsListSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Programs Management</h1>
        <p className="text-muted-foreground">
          Manage PESO programs and services displayed on the portal
        </p>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search programs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Add Program
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPrograms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {searchQuery ? "No programs found matching your search." : "No programs found. Add your first program!"}
                </TableCell>
              </TableRow>
            ) : (
              paginatedPrograms.map((program) => (
                <TableRow key={program.id}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  </TableCell>
                  <TableCell>
                    {program.image ? (
                      <div className="relative w-10 h-10">
                        <Image
                          src={program.image}
                          alt={program.title}
                          fill
                          className="object-contain rounded"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
                        N/A
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{program.title}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {program.description || <span className="text-muted-foreground">No description</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={program.status === "active" ? "default" : "secondary"}>
                      {program.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{program.order}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(program)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => openDelete(program)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {endIndex} of {filteredPrograms.length} programs
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ProgramCreateDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onProgramCreated={handleProgramCreated}
      />

      {selectedProgram && (
        <>
          <ProgramEditDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            program={selectedProgram}
            onProgramUpdated={handleProgramUpdated}
          />
          <ProgramDeleteDialog
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
            program={selectedProgram}
            onProgramDeleted={handleProgramDeleted}
          />
        </>
      )}
    </div>
  )
}
