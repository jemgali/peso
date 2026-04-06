"use client"

import React, { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { Plus, Search, GripVertical } from "lucide-react"
import Image from "next/image"
import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import { Spinner } from "@/ui/spinner"
import { Badge } from "@/ui/badge"
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

export default function Programs() {
  const [programs, setPrograms] = useState<ProgramData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<ProgramData | null>(null)

  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/admin/programs")
      if (!response.ok) {
        throw new Error("Failed to fetch programs")
      }
      const data = await response.json()
      setPrograms(data.programs)
    } catch (error) {
      console.error("Error fetching programs:", error)
      toast.error("Failed to load programs")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPrograms()
  }, [])

  const filteredPrograms = useMemo(() => {
    if (!searchQuery.trim()) return programs

    const query = searchQuery.toLowerCase()
    return programs.filter(
      (program) =>
        program.title.toLowerCase().includes(query) ||
        (program.description && program.description.toLowerCase().includes(query))
    )
  }, [programs, searchQuery])

  const handleEditClick = (program: ProgramData) => {
    setSelectedProgram(program)
    setEditDialogOpen(true)
  }

  const handleDeleteClick = (program: ProgramData) => {
    setSelectedProgram(program)
    setDeleteDialogOpen(true)
  }

  const handleProgramCreated = (newProgram: ProgramData) => {
    setPrograms((prev) => [...prev, newProgram].sort((a, b) => a.order - b.order))
    setCreateDialogOpen(false)
  }

  const handleProgramUpdated = (updatedProgram: ProgramData) => {
    setPrograms((prev) =>
      prev.map((program) => (program.id === updatedProgram.id ? updatedProgram : program))
        .sort((a, b) => a.order - b.order)
    )
    setEditDialogOpen(false)
    setSelectedProgram(null)
  }

  const handleProgramDeleted = (deletedProgramId: string) => {
    setPrograms((prev) => prev.filter((program) => program.id !== deletedProgramId))
    setDeleteDialogOpen(false)
    setSelectedProgram(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
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
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Program
        </Button>
      </div>

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
            {filteredPrograms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {searchQuery ? "No programs found matching your search." : "No programs found. Add your first program!"}
                </TableCell>
              </TableRow>
            ) : (
              filteredPrograms.map((program) => (
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
                        onClick={() => handleEditClick(program)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteClick(program)}
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
      </div>

      <ProgramCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onProgramCreated={handleProgramCreated}
      />

      {selectedProgram && (
        <>
          <ProgramEditDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            program={selectedProgram}
            onProgramUpdated={handleProgramUpdated}
          />
          <ProgramDeleteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            program={selectedProgram}
            onProgramDeleted={handleProgramDeleted}
          />
        </>
      )}
    </div>
  )
}
