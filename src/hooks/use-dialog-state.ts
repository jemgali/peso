"use client"

import { useState, useCallback } from "react"

export interface UseDialogStateReturn<T> {
  /** Whether create dialog is open */
  createOpen: boolean
  /** Set create dialog open state */
  setCreateOpen: (open: boolean) => void
  /** Whether edit dialog is open */
  editOpen: boolean
  /** Set edit dialog open state */
  setEditOpen: (open: boolean) => void
  /** Whether delete dialog is open */
  deleteOpen: boolean
  /** Set delete dialog open state */
  setDeleteOpen: (open: boolean) => void
  /** Currently selected item for edit/delete */
  selectedItem: T | null
  /** Set selected item */
  setSelectedItem: (item: T | null) => void
  /** Open create dialog */
  openCreate: () => void
  /** Open edit dialog with item */
  openEdit: (item: T) => void
  /** Open delete dialog with item */
  openDelete: (item: T) => void
  /** Close all dialogs and clear selection */
  closeAll: () => void
}

/**
 * Hook for managing create/edit/delete dialog state.
 * 
 * @returns Dialog state management utilities
 * 
 * @example
 * const { createOpen, openCreate, openEdit, selectedItem } = useDialogState<User>()
 * 
 * <Button onClick={openCreate}>Add User</Button>
 * <Button onClick={() => openEdit(user)}>Edit</Button>
 */
export function useDialogState<T>(): UseDialogStateReturn<T> {
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<T | null>(null)

  const openCreate = useCallback(() => {
    setSelectedItem(null)
    setCreateOpen(true)
  }, [])

  const openEdit = useCallback((item: T) => {
    setSelectedItem(item)
    setEditOpen(true)
  }, [])

  const openDelete = useCallback((item: T) => {
    setSelectedItem(item)
    setDeleteOpen(true)
  }, [])

  const closeAll = useCallback(() => {
    setCreateOpen(false)
    setEditOpen(false)
    setDeleteOpen(false)
    setSelectedItem(null)
  }, [])

  return {
    createOpen,
    setCreateOpen,
    editOpen,
    setEditOpen,
    deleteOpen,
    setDeleteOpen,
    selectedItem,
    setSelectedItem,
    openCreate,
    openEdit,
    openDelete,
    closeAll,
  }
}
