"use client";

import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import { hasPermission } from "@/lib/permissions";
import { ActionItemFormModal } from "@/components/action-item-form-modal";
import { ProtectedLayout } from "@/components/protected-layout";
import { useActionItemStore } from "@/stores/action-item-store";
import { useGoalStore } from "@/stores/goal-store";
import { useToastStore } from "@/stores/toast-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

const columns = [
  { id: "OPEN", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "DONE", title: "Done" }
];

const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"];

function formatDate(value) {
  if (!value) {
    return "No due date";
  }

  return new Date(value).toLocaleDateString();
}

function isOverdue(actionItem) {
  return (
    actionItem.dueDate &&
    actionItem.status !== "DONE" &&
    new Date(actionItem.dueDate).getTime() < Date.now()
  );
}

function statusLabel(status) {
  if (status === "OPEN") {
    return "To Do";
  }

  if (status === "IN_PROGRESS") {
    return "In Progress";
  }

  return "Done";
}

function sortByDueDate(items) {
  return [...items].sort((left, right) => {
    if (!left.dueDate && !right.dueDate) {
      return new Date(right.createdAt) - new Date(left.createdAt);
    }

    if (!left.dueDate) {
      return 1;
    }

    if (!right.dueDate) {
      return -1;
    }

    return new Date(left.dueDate) - new Date(right.dueDate);
  });
}

function ActionItemCard({ actionItem, accentColor, onEdit, pending }) {
  const overdue = isOverdue(actionItem);

  return (
    <button
      type="button"
      onClick={() => onEdit(actionItem)}
      className={`w-full rounded-[1.5rem] border p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${
        overdue ? "border-rose-200 bg-rose-50/60" : "border-slate-200 bg-white"
      } ${pending ? "opacity-70" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
          {actionItem.priority}
        </span>
        {overdue ? (
          <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700">
            Overdue
          </span>
        ) : null}
        {pending ? (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            Syncing
          </span>
        ) : null}
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-950">{actionItem.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
        {actionItem.description || "No description added yet."}
      </p>
      <div className="mt-4 space-y-2 text-xs text-slate-500">
        <p>Due {formatDate(actionItem.dueDate)}</p>
        <p>Assignee: {actionItem.assignee?.name || "Unassigned"}</p>
        {actionItem.goal ? <p>Goal: {actionItem.goal.title}</p> : null}
      </div>
      <div className="mt-4 h-1.5 rounded-full bg-slate-100">
        <div
          className="h-1.5 rounded-full"
          style={{
            width: actionItem.status === "DONE" ? "100%" : actionItem.status === "IN_PROGRESS" ? "62%" : "26%",
            backgroundColor: accentColor
          }}
        />
      </div>
    </button>
  );
}

export default function ActionItemsPage() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const members = useWorkspaceStore((state) => state.members);
  const goals = useGoalStore((state) => state.goals);
  const fetchGoals = useGoalStore((state) => state.fetchGoals);
  const actionItems = useActionItemStore((state) => state.actionItems);
  const filters = useActionItemStore((state) => state.filters);
  const viewMode = useActionItemStore((state) => state.viewMode);
  const selectedIds = useActionItemStore((state) => state.selectedIds);
  const pendingStatusIds = useActionItemStore((state) => state.pendingStatusIds);
  const loading = useActionItemStore((state) => state.loading);
  const error = useActionItemStore((state) => state.error);
  const clearError = useActionItemStore((state) => state.clearError);
  const setViewMode = useActionItemStore((state) => state.setViewMode);
  const setFilters = useActionItemStore((state) => state.setFilters);
  const fetchActionItems = useActionItemStore((state) => state.fetchActionItems);
  const createActionItem = useActionItemStore((state) => state.createActionItem);
  const updateActionItem = useActionItemStore((state) => state.updateActionItem);
  const updateActionItemStatus = useActionItemStore((state) => state.updateActionItemStatus);
  const bulkUpdateStatus = useActionItemStore((state) => state.bulkUpdateStatus);
  const deleteActionItem = useActionItemStore((state) => state.deleteActionItem);
  const toggleSelection = useActionItemStore((state) => state.toggleSelection);
  const clearSelection = useActionItemStore((state) => state.clearSelection);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingActionItem, setEditingActionItem] = useState(null);
  const pushToast = useToastStore((state) => state.pushToast);
  const canCreateActionItem = hasPermission(activeWorkspace, "CREATE_ACTION_ITEM");
  const canUpdateActionItem = hasPermission(activeWorkspace, "UPDATE_ACTION_ITEM");
  const canDeleteContent = hasPermission(activeWorkspace, "DELETE_CONTENT");

  useEffect(() => {
    if (!activeWorkspace?.id) {
      return;
    }

    fetchGoals({
      workspaceId: activeWorkspace.id
    }).catch(() => {});
  }, [activeWorkspace?.id, fetchGoals]);

  useEffect(() => {
    if (!activeWorkspace?.id) {
      return;
    }

    fetchActionItems(activeWorkspace.id).catch(() => {});
  }, [activeWorkspace?.id, fetchActionItems, fetchGoals, filters]);

  useEffect(() => {
    if (error) {
      pushToast({ type: "error", message: error });
      clearError();
    }
  }, [clearError, error, pushToast]);

  async function refreshBoard() {
    await fetchActionItems(activeWorkspace.id);
  }

  async function handleCreateActionItem(values) {
    await createActionItem({
      ...values,
      workspaceId: activeWorkspace.id
    });
    setShowCreateModal(false);
    pushToast({ type: "success", message: "Action item created." });
    await refreshBoard();
  }

  async function handleUpdateActionItem(values) {
    await updateActionItem(editingActionItem.id, values);
    setEditingActionItem(null);
    pushToast({ type: "success", message: "Action item updated." });
    await refreshBoard();
  }

  async function handleDeleteActionItem() {
    await deleteActionItem(editingActionItem.id);
    setEditingActionItem(null);
    pushToast({ type: "success", message: "Action item deleted." });
    await refreshBoard();
  }

  async function handleDragEnd(result) {
    if (!result.destination || result.destination.droppableId === result.source.droppableId) {
      return;
    }

    await updateActionItemStatus(result.draggableId, result.destination.droppableId);
    await refreshBoard();
  }

  async function handleBulkStatusChange(status) {
    await bulkUpdateStatus(activeWorkspace.id, status);
    pushToast({ type: "success", message: "Bulk status update applied." });
    await refreshBoard();
  }

  const kanbanItems = columns.map((column) => ({
    ...column,
    items: sortByDueDate(actionItems.filter((actionItem) => actionItem.status === column.id))
  }));

  const tableItems = sortByDueDate(actionItems);

  return (
    <ProtectedLayout>
      <section className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
              Action Items
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Task execution board
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Run work from a Kanban board or switch to a sortable list without losing your filters.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full bg-white p-1 shadow-soft ring-1 ring-slate-200">
              {["kanban", "list"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    viewMode === mode ? "text-white" : "text-slate-600"
                  }`}
                  style={viewMode === mode ? { backgroundColor: activeWorkspace?.accentColor || "#2745f2" } : {}}
                >
                  {mode === "kanban" ? "Kanban" : "List"}
                </button>
              ))}
            </div>
            {canCreateActionItem ? (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="rounded-full px-5 py-3 text-sm font-medium text-white"
                style={{ backgroundColor: activeWorkspace?.accentColor || "#2745f2" }}
              >
                Create action item
              </button>
            ) : (
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
                Task creation is restricted in this workspace
              </span>
            )}
          </div>
        </div>

        <section className="grid gap-4 rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200 md:grid-cols-3 xl:grid-cols-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Priority</span>
            <select
              value={filters.priority}
              onChange={(event) => setFilters({ priority: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            >
              <option value="">All priorities</option>
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Assignee</span>
            <select
              value={filters.assigneeId}
              onChange={(event) => setFilters({ assigneeId: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            >
              <option value="">All assignees</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Status</span>
            <select
              value={filters.status}
              onChange={(event) => setFilters({ status: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            >
              <option value="">All statuses</option>
              <option value="OPEN">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Goal</span>
            <select
              value={filters.goalId}
              onChange={(event) => setFilters({ goalId: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            >
              <option value="">All goals</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Sort</span>
            <select
              value={`${filters.sortBy}:${filters.sortOrder}`}
              onChange={(event) => {
                const [sortBy, sortOrder] = event.target.value.split(":");
                setFilters({ sortBy, sortOrder });
              }}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            >
              <option value="dueDate:asc">Due date</option>
              <option value="priority:desc">Priority</option>
              <option value="status:asc">Status</option>
              <option value="title:asc">Title</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Search</span>
            <input
              type="text"
              value={filters.search}
              onChange={(event) => setFilters({ search: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
              placeholder="Search titles"
            />
          </label>
          <label className="flex items-center gap-3 md:col-span-3 xl:col-span-6">
            <input
              type="checkbox"
              checked={filters.overdue === "true"}
              onChange={(event) => setFilters({ overdue: event.target.checked ? "true" : "false" })}
            />
            <span className="text-sm text-slate-700">Show overdue items only</span>
          </label>
        </section>

        {viewMode === "kanban" ? (
          <DragDropContext onDragEnd={canUpdateActionItem ? handleDragEnd : () => {}}>
            <section className="grid gap-5 xl:grid-cols-3">
              {kanbanItems.map((column) => (
                <Droppable key={column.id} droppableId={column.id}>
                  {(provided, snapshot) => (
                    <article
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`rounded-[2rem] p-5 shadow-soft ring-1 ${
                        snapshot.isDraggingOver
                          ? "bg-brand-50 ring-brand-200"
                          : "bg-white ring-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold text-slate-950">{column.title}</h2>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                          {column.items.length}
                        </span>
                      </div>
                      <div className="mt-5 space-y-4">
                        {column.items.map((actionItem, index) => (
                          <Draggable key={actionItem.id} draggableId={actionItem.id} index={index}>
                            {(dragProvided) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                              >
                                <ActionItemCard
                                  actionItem={actionItem}
                                  accentColor={activeWorkspace?.accentColor || "#2745f2"}
                                  onEdit={canUpdateActionItem ? setEditingActionItem : () => {}}
                                  pending={pendingStatusIds[actionItem.id]}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {!column.items.length ? (
                          <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                            No items in {column.title.toLowerCase()}.
                          </div>
                        ) : null}
                      </div>
                    </article>
                  )}
                </Droppable>
              ))}
            </section>
          </DragDropContext>
        ) : (
          <section className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
                  {selectedIds.length} selected
                </span>
                <select
                  defaultValue=""
                  disabled={!canUpdateActionItem || !selectedIds.length}
                  onChange={(event) => {
                    if (event.target.value) {
                      handleBulkStatusChange(event.target.value);
                      event.target.value = "";
                    }
                  }}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
                >
                  <option value="">Bulk status</option>
                  <option value="OPEN">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600"
                >
                  Clear selection
                </button>
              </div>
              <p className="text-sm text-slate-500">Sorted by due date by default.</p>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Select</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Goal</th>
                    <th className="px-4 py-3 font-medium">Assignee</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Due date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {tableItems.map((actionItem) => {
                    const overdue = isOverdue(actionItem);

                    return (
                      <tr
                        key={actionItem.id}
                        className={`${overdue ? "bg-rose-50/50" : ""} cursor-pointer`}
                        onClick={() => canUpdateActionItem && setEditingActionItem(actionItem)}
                      >
                        <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(actionItem.id)}
                            onChange={() => toggleSelection(actionItem.id)}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-900">{actionItem.title}</p>
                          <p className="mt-1 text-slate-500">
                            {actionItem.description || "No description"}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {actionItem.goal?.title || "No linked goal"}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {actionItem.assignee?.name || "Unassigned"}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {actionItem.priority}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{statusLabel(actionItem.status)}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              overdue
                                ? "bg-rose-100 text-rose-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {formatDate(actionItem.dueDate)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!loading && !tableItems.length ? (
              <div className="mt-6 rounded-[1.5rem] bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                No action items match the current filters.
              </div>
            ) : null}
          </section>
        )}
      </section>

      <ActionItemFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateActionItem}
        members={members}
        goals={goals}
        loading={loading}
        title="Create action item"
      />

      <ActionItemFormModal
        open={Boolean(editingActionItem)}
        onClose={() => setEditingActionItem(null)}
        onSubmit={handleUpdateActionItem}
        onDelete={handleDeleteActionItem}
        members={members}
        goals={goals}
        loading={loading}
        initialValues={editingActionItem}
        title="Edit action item"
        canDelete={canDeleteContent}
      />
    </ProtectedLayout>
  );
}
