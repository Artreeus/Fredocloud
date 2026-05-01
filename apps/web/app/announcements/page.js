"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { hasPermission } from "@/lib/permissions";
import { AnnouncementFormModal } from "@/components/announcement-form-modal";
import { ProtectedLayout } from "@/components/protected-layout";
import { ReactionBar } from "@/components/reaction-bar";
import { useAnnouncementStore } from "@/stores/announcement-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

export default function AnnouncementsPage() {
  const activeWorkspace = useWorkspaceStore((state) => state.activeWorkspace);
  const announcements = useAnnouncementStore((state) => state.announcements);
  const loading = useAnnouncementStore((state) => state.loading);
  const error = useAnnouncementStore((state) => state.error);
  const pendingReactionIds = useAnnouncementStore((state) => state.pendingReactionIds);
  const fetchAnnouncements = useAnnouncementStore((state) => state.fetchAnnouncements);
  const createAnnouncement = useAnnouncementStore((state) => state.createAnnouncement);
  const togglePin = useAnnouncementStore((state) => state.togglePin);
  const toggleReaction = useAnnouncementStore((state) => state.toggleReaction);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const canCreate = hasPermission(activeWorkspace, "POST_ANNOUNCEMENT");
  const canPin = hasPermission(activeWorkspace, "PIN_ANNOUNCEMENT");

  useEffect(() => {
    if (activeWorkspace?.id) {
      fetchAnnouncements({ workspaceId: activeWorkspace.id }).catch(() => {});
    }
  }, [activeWorkspace?.id, fetchAnnouncements]);

  async function handleCreateAnnouncement(values) {
    await createAnnouncement({
      workspaceId: activeWorkspace.id,
      ...values
    });
    setShowCreateModal(false);
    await fetchAnnouncements({ workspaceId: activeWorkspace.id });
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
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-brand-600">
              Announcements
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Team communication
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Pinned updates stay on top, while recent announcements keep everyone aligned.
            </p>
          </div>
          {canCreate ? (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="rounded-full px-5 py-3 text-sm font-medium text-white"
              style={{ backgroundColor: activeWorkspace?.accentColor || "#2745f2" }}
            >
              Create announcement
            </button>
          ) : (
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-600">
              Members can read and react
            </span>
          )}
        </div>

        {error ? (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
        ) : null}

        <div className="space-y-5">
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className="rounded-[2rem] bg-white p-6 shadow-soft ring-1 ring-slate-200"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {announcement.pinned ? (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                        Pinned
                      </span>
                    ) : null}
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {new Date(announcement.publishedAt || announcement.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950">
                    {announcement.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">By {announcement.author?.name}</p>
                </div>
                {canPin ? (
                  <button
                    type="button"
                    onClick={() => handleTogglePin(announcement)}
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700"
                  >
                    {announcement.pinned ? "Unpin" : "Pin"}
                  </button>
                ) : null}
              </div>

              <div
                className="prose prose-slate mt-6 max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: announcement.body }}
              />

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <ReactionBar
                    reactionSummary={announcement.reactionSummary}
                    onToggle={(type) => handleToggleReaction(announcement.id, type)}
                    loading={loading || pendingReactionIds[announcement.id]}
                  />
                <Link
                  href={`/announcements/${announcement.id}`}
                  className="text-sm font-medium text-slate-700"
                >
                  {announcement.commentCount} comments
                </Link>
              </div>
            </article>
          ))}

          {!loading && !announcements.length ? (
            <div className="rounded-[2rem] bg-white p-8 text-sm text-slate-500 shadow-soft ring-1 ring-slate-200">
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
    </ProtectedLayout>
  );
}
