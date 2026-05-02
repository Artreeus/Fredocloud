"use client";

import { useEffect } from "react";
import { disconnectWorkspaceSocket, getWorkspaceSocket } from "@/lib/socket-client";
import { useActionItemStore } from "@/stores/action-item-store";
import { useAnnouncementStore } from "@/stores/announcement-store";
import { useWorkspaceStore } from "@/stores/workspace-store";

export function WorkspaceRealtimeBridge({ workspaceId }) {
  const applySocketAnnouncement = useAnnouncementStore((state) => state.applySocketAnnouncement);
  const applySocketComment = useAnnouncementStore((state) => state.applySocketComment);
  const applySocketActionItem = useActionItemStore((state) => state.applySocketActionItem);
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

    function handleActionItemEvent(payload) {
      if (payload?.actionItem) {
        applySocketActionItem(payload.actionItem);
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
    socket.on("action-item:update", handleActionItemEvent);
    socket.on("presence:sync", handlePresenceSync);
    socket.on("user:online", handleUserOnline);
    socket.on("user:offline", handleUserOffline);

    return () => {
      socket.off("announcement:new", handleAnnouncementEvent);
      socket.off("reaction:update", handleAnnouncementEvent);
      socket.off("comment:new", handleCommentEvent);
      socket.off("action-item:update", handleActionItemEvent);
      socket.off("presence:sync", handlePresenceSync);
      socket.off("user:online", handleUserOnline);
      socket.off("user:offline", handleUserOffline);
      disconnectWorkspaceSocket(workspaceId);
    };
  }, [
    applySocketActionItem,
    applySocketAnnouncement,
    applySocketComment,
    setMemberPresence,
    setPresenceSnapshot,
    workspaceId
  ]);

  return null;
}
