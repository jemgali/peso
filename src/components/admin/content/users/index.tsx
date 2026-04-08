"use client"

import React from "react"
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/ui/input"
import { Button } from "@/ui/button"
import { Badge } from "@/ui/badge"
import { UsersListSkeleton } from "@/ui/skeletons"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table"
import { UserCreateDialog } from "./user-create-dialog"
import { UserEditDialog } from "./user-edit-dialog"
import { UserArchiveDialog } from "./user-archive-dialog"
import { type UserData } from "@/lib/validations/user"
import { useDialogState, useDataList } from "@/hooks"

export default function Users() {
  const dialogState = useDialogState<UserData>()
  const dataList = useDataList<UserData>("/api/admin/users", {
    searchKeys: ["name", "email", "role"],
    pageSize: 10,
  })

  const handleUserCreated = (newUser: UserData) => {
    dataList.setItems((prev) => [newUser, ...prev])
    dialogState.setCreateOpen(false)
  }

  const handleUserUpdated = (updatedUser: UserData) => {
    dataList.setItems((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    )
    dialogState.closeAll()
  }

  const handleUserArchived = (archivedUser: UserData) => {
    dataList.setItems((prev) =>
      prev.map((user) => (user.id === archivedUser.id ? archivedUser : user))
    )
    dialogState.closeAll()
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (dataList.isLoading) {
    return <UsersListSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage employee and client user accounts
        </p>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, email, or role..."
            value={dataList.searchQuery}
            onChange={(e) => dataList.setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={dialogState.openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Add User
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataList.paginatedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {dataList.searchQuery ? "No users found matching your search." : "No users found."}
                </TableCell>
              </TableRow>
            ) : (
              dataList.paginatedItems.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.role || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.banned ? (
                      <Badge variant="destructive">Archived</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dialogState.openEdit(user)}
                        disabled={user.banned === true}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dialogState.openDelete(user)}
                        disabled={user.banned === true}
                      >
                        Archive
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {dataList.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {dataList.startIndex + 1} to {dataList.endIndex} of {dataList.filteredItems.length} users
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => dataList.setCurrentPage(Math.max(1, dataList.currentPage - 1))}
                disabled={dataList.currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dataList.setCurrentPage(Math.min(dataList.totalPages, dataList.currentPage + 1))}
                disabled={dataList.currentPage === dataList.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <UserCreateDialog
        open={dialogState.createOpen}
        onOpenChange={dialogState.setCreateOpen}
        onUserCreated={handleUserCreated}
      />

      {dialogState.selectedItem && (
        <>
          <UserEditDialog
            open={dialogState.editOpen}
            onOpenChange={dialogState.setEditOpen}
            user={dialogState.selectedItem}
            onUserUpdated={handleUserUpdated}
          />
          <UserArchiveDialog
            open={dialogState.deleteOpen}
            onOpenChange={dialogState.setDeleteOpen}
            user={dialogState.selectedItem}
            onUserArchived={handleUserArchived}
          />
        </>
      )}
    </div>
  )
}
