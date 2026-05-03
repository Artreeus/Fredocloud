"use client";

import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useEffect, useState } from "react";
import { Loader } from "@/components/ui/loader";
import { CustomSelect } from "@/components/ui/select";
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

function ActionItemCard({ actionItem, onEdit, pending }) {
  const overdue = isOverdue(actionItem);

  return (
    <button
      type="button"
      onClick={() => onEdit(actionItem)}
      className={`w-full rounded-[1.8rem] border p-5 text-left shadow-sm transition hover:-translate-y-0.5 ${
        overdue ? "border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20" : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
      } ${pending ? "opacity-70" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {actionItem.priority}
        </span>
        {overdue ? (
          <span className="rounded-full bg-rose-100 dark:bg-rose-900/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            Overdue
          </span>
        ) : null}
        {pending ? (
          <span className="rounded-full bg-amber-50 dark:bg-amber-900/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            Syncing
          </span>
        ) : null}
      </div>
      <h3 className="mt-4 font-display text-xl text-slate-950 dark:text-white">{actionItem.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {actionItem.description || "No description added yet."}
      </p>
      <div className="mt-4 space-y-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        <p>Due {formatDate(actionItem.dueDate)}</p>
        <p>Assignee: {actionItem.assignee?.name || "Unassigned"}</p>
        {actionItem.goal ? <p>Goal: {actionItem.goal.title}</p> : null}
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-slate-950 dark:bg-brand-500 transition-all duration-500"
          style={{ width: actionItem.status === "DONE" ? "100%" : actionItem.status === "IN_PROGRESS" ? "62%" : "26%" }}
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
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-[2.3rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-500">
              Action Items
            </p>
            <h1 className="mt-4 font-display text-5xl text-slate-950 dark:text-white">
              Task execution board
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
              Run work from a Kanban board or switch to a sortable list without losing your filters.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1 shadow-sm">
              {["kanban", "list"].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                    viewMode === mode ? "bg-slate-950 text-white dark:bg-brand-500" : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                  }`}
                >
                  {mode === "kanban" ? "Kanban" : "List"}
                </button>
              ))}
            </div>
            {canCreateActionItem ? (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="rounded-full bg-slate-950 dark:bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95"
              >
                Create action item
              </button>
            ) : (
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                Task creation is restricted in this workspace
              </span>
            )}
          </div>
        </div>

        <section className="grid gap-4 rounded-[2.1rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm md:grid-cols-3 xl:grid-cols-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Priority</span>
            <CustomSelect
              value={filters.priority}
              onChange={(value) => setFilters({ priority: value })}
              options={[
                { value: "", label: "All priorities" },
                ...priorityOptions.map((priority) => ({ value: priority, label: priority }))
              ]}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Assignee</span>
            <CustomSelect
              value={filters.assigneeId}
              onChange={(value) => setFilters({ assigneeId: value })}
              options={[
                { value: "", label: "All assignees" },
                ...members.map((member) => ({ value: member.id, label: member.name }))
              ]}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</span>
            <CustomSelect
              value={filters.status}
              onChange={(value) => setFilters({ status: value })}
              options={[
                { value: "", label: "All statuses" },
                { value: "OPEN", label: "To Do" },
                { value: "IN_PROGRESS", label: "In Progress" },
                { value: "DONE", label: "Done" }
              ]}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Goal</span>
            <CustomSelect
              value={filters.goalId}
              onChange={(value) => setFilters({ goalId: value })}
              options={[
                { value: "", label: "All goals" },
                ...goals.map((goal) => ({ value: goal.id, label: goal.title }))
              ]}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Sort</span>
            <CustomSelect
              value={`${filters.sortBy}:${filters.sortOrder}`}
              onChange={(value) => {
                const [sortBy, sortOrder] = value.split(":");
                setFilters({ sortBy, sortOrder });
              }}
              options={[
                { value: "dueDate:asc", label: "Due date" },
                { value: "priority:desc", label: "Priority" },
                { value: "status:asc", label: "Status" },
                { value: "title:asc", label: "Title" }
              ]}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Search</span>
            <input
              type="text"
              value={filters.search}
              onChange={(event) => setFilters({ search: event.target.value })}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 text-sm dark:text-white outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-900/20"
              placeholder="Search titles"
            />
          </label>
          <label className="flex items-center gap-3 md:col-span-3 xl:col-span-6">
            <input
              type="checkbox"
              checked={filters.overdue === "true"}
              onChange={(event) => setFilters({ overdue: event.target.checked ? "true" : "false" })}
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Show overdue items only</span>
          </label>
        </section>

        {loading && actionItems.length === 0 ? (
          <div className="flex h-[400px] items-center justify-center rounded-[2.1rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <Loader size="lg" />
          </div>
        ) : viewMode === "kanban" ? (
          <DragDropContext onDragEnd={canUpdateActionItem ? handleDragEnd : () => {}}>
            <section className="grid gap-5 xl:grid-cols-3">
              {kanbanItems.map((column) => (
                <Droppable key={column.id} droppableId={column.id}>
                  {(provided, snapshot) => (
                    <article
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`rounded-[2.05rem] border p-5 shadow-sm transition ${
                        snapshot.isDraggingOver
                          ? "border-brand-200 bg-brand-50/90 dark:border-brand-900/50 dark:bg-brand-950/20"
                          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="font-display text-2xl text-slate-950 dark:text-white">{column.title}</h2>
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs text-slate-600 dark:text-slate-400">
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
                                  onEdit={canUpdateActionItem ? setEditingActionItem : () => {}}
                                  pending={pendingStatusIds[actionItem.id]}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {!column.items.length ? (
                          <div className="rounded-[1.6rem] border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
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
          <section className="rounded-[2.1rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
                  {selectedIds.length} selected
                </span>
                <div className="w-40">
                  <CustomSelect
                    value=""
                    disabled={!canUpdateActionItem || !selectedIds.length}
                    onChange={(value) => {
                      if (value) {
                        handleBulkStatusChange(value);
                      }
                    }}
                    options={[
                      { value: "", label: "Bulk status" },
                      { value: "OPEN", label: "To Do" },
                      { value: "IN_PROGRESS", label: "In Progress" },
                      { value: "DONE", label: "Done" }
                    ]}
                  />
                </div>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm text-slate-600 dark:text-slate-400 transition hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Clear selection
                </button>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Sorted by due date by default.</p>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
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
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {tableItems.map((actionItem) => {
                    const overdue = isOverdue(actionItem);

                    return (
                      <tr
                        key={actionItem.id}
                        className={`${overdue ? "bg-rose-50/50 dark:bg-rose-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"} transition cursor-pointer`}
                        onClick={() => canUpdateActionItem && setEditingActionItem(actionItem)}
                      >
                        <td className="px-4 py-4" onClick={(event) => event.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(actionItem.id)}
                            onChange={() => toggleSelection(actionItem.id)}
                            className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-brand-600 focus:ring-brand-600 dark:bg-slate-900"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-bold text-slate-900 dark:text-white">{actionItem.title}</p>
                          <p className="mt-1 text-slate-500 dark:text-slate-400">
                            {actionItem.description || "No description"}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                          {actionItem.goal?.title || "No linked goal"}
                        </td>
                        <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                          {actionItem.assignee?.name || "Unassigned"}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            {actionItem.priority}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-medium text-slate-600 dark:text-slate-400">{statusLabel(actionItem.status)}</td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                              overdue
                                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
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
              <div className="mt-6 rounded-[1.6rem] border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
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
