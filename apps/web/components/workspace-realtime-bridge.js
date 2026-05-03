"use client";

import { useEffect } from "react";
import { disconnectWorkspaceSocket, getWorkspaceSocket } from "@/lib/socket-client";
import { useActionItemStore } from "@/stores/action-item-store";
import { useAnnouncementStore } from "@/stores/announcement-store";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function WorkspaceRealtimeBridge({ workspaceId }) {
  const user = useAuthStore((state) => state.user);
  const applySocketAnnouncement = useAnnouncementStore((state) => state.applySocketAnnouncement);
  const applySocketComment = useAnnouncementStore((state) => state.applySocketComment);
  const applySocketCommentDelete = useAnnouncementStore((state) => state.applySocketCommentDelete);
  const applySocketCommentUpdate = useAnnouncementStore((state) => state.applySocketCommentUpdate);
  const applySocketActionItem = useActionItemStore((state) => state.applySocketActionItem);
  const pushSocketNotification = useNotificationStore((state) => state.pushSocketNotification);
  const setPresenceSnapshot = useWorkspaceStore((state) => state.setPresenceSnapshot);
  const setMemberPresence = useWorkspaceStore((state) => state.setMemberPresence);

  useEffect(() => {
    if (!workspaceId) {
      return undefined;
    }

    const socket = getWorkspaceSocket(workspaceId);

    function handleAnnouncementEvent(payload) {
      if (payload?.announcement) {
        applySocketAnnouncement(payload.announcement);
      }
    }

    function handleCommentEvent(payload) {
      if (payload?.comment) {
        applySocketComment(payload);
      }
    }

    function handleCommentUpdateEvent(payload) {
      if (payload?.comment) {
        applySocketCommentUpdate(payload);
      }
    }

    function handleCommentDeleteEvent(payload) {
      if (payload?.commentId) {
        applySocketCommentDelete(payload);
      }
    }

    function handleActionItemEvent(payload) {
      if (payload?.actionItem) {
        applySocketActionItem(payload.actionItem);
      }
    }

    function handleNotificationEvent(payload) {
      if (payload?.notification) {
        pushSocketNotification(payload.notification, user?.id);
      }
    }

    function handlePresenceSync(payload) {
      setPresenceSnapshot(payload?.userIds || []);
    }

    function handleUserOnline(payload) {
      if (payload?.userId) {
        setMemberPresence(payload.userId, true);
      }
    }

    function handleUserOffline(payload) {
      if (payload?.userId) {
        setMemberPresence(payload.userId, false);
      }
    }

    socket.on("announcement:new", handleAnnouncementEvent);
    socket.on("reaction:update", handleAnnouncementEvent);
    socket.on("comment:new", handleCommentEvent);
    socket.on("comment:update", handleCommentUpdateEvent);
    socket.on("comment:delete", handleCommentDeleteEvent);
    socket.on("action-item:update", handleActionItemEvent);
    socket.on("notification:new", handleNotificationEvent);
    socket.on("presence:sync", handlePresenceSync);
    socket.on("user:online", handleUserOnline);
    socket.on("user:offline", handleUserOffline);

    return () => {
      socket.off("announcement:new", handleAnnouncementEvent);
      socket.off("reaction:update", handleAnnouncementEvent);
      socket.off("comment:new", handleCommentEvent);
      socket.off("comment:update", handleCommentUpdateEvent);
      socket.off("comment:delete", handleCommentDeleteEvent);
      socket.off("action-item:update", handleActionItemEvent);
      socket.off("notification:new", handleNotificationEvent);
      socket.off("presence:sync", handlePresenceSync);
      socket.off("user:online", handleUserOnline);
      socket.off("user:offline", handleUserOffline);
      disconnectWorkspaceSocket(workspaceId);
    };
  }, [
    applySocketActionItem,
    applySocketAnnouncement,
    applySocketComment,
    applySocketCommentDelete,
    applySocketCommentUpdate,
    pushSocketNotification,
    setMemberPresence,
    setPresenceSnapshot,
    user?.id,
    workspaceId
  ]);

  return null;
}
