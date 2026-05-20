"use client";

import { useEffect } from "react";
import { disconnectWorkspaceChannels, getWorkspaceChannels } from "@/lib/pusher-client";
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

    const channelGroup = getWorkspaceChannels(workspaceId);
    const { private: privateChannel, presence: presenceChannel } = channelGroup;

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

    function handlePresenceSync(data) {
      setPresenceSnapshot(Object.keys(data.members));
    }

    function handleMemberAdded(member) {
      setMemberPresence(member.id, true);
    }

    function handleMemberRemoved(member) {
      setMemberPresence(member.id, false);
    }

    privateChannel.bind("announcement:new", handleAnnouncementEvent);
    privateChannel.bind("reaction:update", handleAnnouncementEvent);
    privateChannel.bind("comment:new", handleCommentEvent);
    privateChannel.bind("comment:update", handleCommentUpdateEvent);
    privateChannel.bind("comment:delete", handleCommentDeleteEvent);
    privateChannel.bind("action-item:update", handleActionItemEvent);
    privateChannel.bind("notification:new", handleNotificationEvent);
    presenceChannel.bind("pusher:subscription_succeeded", handlePresenceSync);
    presenceChannel.bind("pusher:member_added", handleMemberAdded);
    presenceChannel.bind("pusher:member_removed", handleMemberRemoved);

    return () => {
      privateChannel.unbind("announcement:new", handleAnnouncementEvent);
      privateChannel.unbind("reaction:update", handleAnnouncementEvent);
      privateChannel.unbind("comment:new", handleCommentEvent);
      privateChannel.unbind("comment:update", handleCommentUpdateEvent);
      privateChannel.unbind("comment:delete", handleCommentDeleteEvent);
      privateChannel.unbind("action-item:update", handleActionItemEvent);
      privateChannel.unbind("notification:new", handleNotificationEvent);
      presenceChannel.unbind("pusher:subscription_succeeded", handlePresenceSync);
      presenceChannel.unbind("pusher:member_added", handleMemberAdded);
      presenceChannel.unbind("pusher:member_removed", handleMemberRemoved);
      disconnectWorkspaceChannels(workspaceId);
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
