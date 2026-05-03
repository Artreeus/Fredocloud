"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hasPermission } from "@/lib/permissions";
import { AnnouncementFormModal } from "@/components/announcement-form-modal";
import { ProtectedLayout } from "@/components/protected-layout";
import { ReactionBar } from "@/components/reaction-bar";
import { useAnnouncementStore } from "@/stores/announcement-store";
import { useToastStore } from "@/stores/toast-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import { Loader } from "@/components/ui/loader";

export default function AnnouncementsPage() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const announcements = useAnnouncementStore((state) => state.announcements);
  const loading = useAnnouncementStore((state) => state.loading);
  const error = useAnnouncementStore((state) => state.error);
  const clearError = useAnnouncementStore((state) => state.clearError);
  const pendingReactionIds = useAnnouncementStore((state) => state.pendingReactionIds);
  const fetchAnnouncements = useAnnouncementStore((state) => state.fetchAnnouncements);
  const createAnnouncement = useAnnouncementStore((state) => state.createAnnouncement);
  const updateAnnouncement = useAnnouncementStore((state) => state.updateAnnouncement);
  const deleteAnnouncement = useAnnouncementStore((state) => state.deleteAnnouncement);
  const togglePin = useAnnouncementStore((state) => state.togglePin);
  const toggleReaction = useAnnouncementStore((state) => state.toggleReaction);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const pushToast = useToastStore((state) => state.pushToast);

  const canCreate = hasPermission(activeWorkspace, "POST_ANNOUNCEMENT");
  const canPin = hasPermission(activeWorkspace, "PIN_ANNOUNCEMENT");
  const canDeleteContent = hasPermission(activeWorkspace, "DELETE_CONTENT");

  useEffect(() => {
    if (activeWorkspace?.id) {
      fetchAnnouncements({ workspaceId: activeWorkspace.id }).catch(() => {});
    }
  }, [activeWorkspace?.id, fetchAnnouncements]);

  useEffect(() => {
    if (error) {
      pushToast({ type: "error", message: error });
      clearError();
    }
  }, [clearError, error, pushToast]);

  async function handleCreateAnnouncement(values) {
    await createAnnouncement({
      workspaceId: activeWorkspace.id,
      ...values
    });
    setShowCreateModal(false);
    await fetchAnnouncements({ workspaceId: activeWorkspace.id });
    pushToast({ type: "success", message: "Announcement published." });
  }

  async function handleUpdateAnnouncement(values) {
    await updateAnnouncement(editingAnnouncement.id, values);
    setEditingAnnouncement(null);
    pushToast({ type: "success", message: "Announcement updated." });
  }

  async function handleDeleteAnnouncement() {
    if (!editingAnnouncement) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${editingAnnouncement.title}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    await deleteAnnouncement(editingAnnouncement.id);
    setEditingAnnouncement(null);
    pushToast({ type: "success", message: "Announcement deleted." });
  }

  async function handleTogglePin(announcement) {
    await togglePin(announcement.id, !announcement.pinned);
  }

  async function handleToggleReaction(announcementId, type) {
    await toggleReaction(announcementId, type);
  }

  return (
    <ProtectedLayout>
      <section className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-[2.3rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600 dark:text-brand-500">
              Announcements
            </p>
            <h1 className="mt-4 font-display text-5xl text-slate-950 dark:text-white">
              Team communication
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
              Pinned updates stay on top, while recent announcements keep everyone aligned.
            </p>
          </div>
          {canCreate ? (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="rounded-full bg-slate-950 dark:bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95"
            >
              Create announcement
            </button>
          ) : (
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400">
              Members can read and react
            </span>
          )}
        </div>

        {loading && announcements.length === 0 && (
          <Loader modal size="xl" />
        )}

        <div className="space-y-5">
            {announcements.map((announcement) => (
              <article
                key={announcement.id}
                className="rounded-[2.1rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {announcement.pinned ? (
                        <span className="rounded-full bg-amber-50 dark:bg-amber-900/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          Pinned
                        </span>
                      ) : null}
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                        {new Date(announcement.publishedAt || announcement.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h2 className="mt-4 font-display text-3xl text-slate-950 dark:text-white">
                      {announcement.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">By {announcement.author?.name}</p>
                  </div>
                  {canPin ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleTogglePin(announcement)}
                        className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        {announcement.pinned ? "Unpin" : "Pin"}
                      </button>
                      {canCreate ? (
                        <button
                          type="button"
                          onClick={() => setEditingAnnouncement(announcement)}
                          className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
                        >
                          Edit
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div
                  className="prose prose-slate dark:prose-invert mt-6 max-w-none text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: announcement.body }}
                />

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <ReactionBar
                      reactionSummary={announcement.reactionSummary}
                      onToggle={(type) => handleToggleReaction(announcement.id, type)}
                      loading={loading || pendingReactionIds[announcement.id]}
                    />
                  <Link
                    href={`/announcements/${announcement.id}`}
                    className="text-sm font-semibold text-slate-600 dark:text-slate-400 transition hover:text-brand-600"
                  >
                    {announcement.commentCount} comments
                  </Link>
                </div>
              </article>
            ))}

            {!announcements.length ? (
              <div className="rounded-[2.1rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400 shadow-sm">
                No announcements yet for this workspace.
              </div>
            ) : null}
          </div>
      </section>

      <AnnouncementFormModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAnnouncement}
        loading={loading}
      />
      <AnnouncementFormModal
        open={Boolean(editingAnnouncement)}
        onClose={() => setEditingAnnouncement(null)}
        onSubmit={handleUpdateAnnouncement}
        onDelete={handleDeleteAnnouncement}
        canDelete={canDeleteContent}
        loading={loading}
        initialValues={editingAnnouncement}
        modalTitle="Edit announcement"
      />
    </ProtectedLayout>
  );
}
