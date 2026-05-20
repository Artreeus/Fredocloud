"use client";

import Pusher from "pusher-js";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

let pusherInstance = null;
const channels = new Map();

function getPusherInstance() {
  if (!pusherInstance) {
    pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      authEndpoint: `${API_BASE_URL}/api/pusher/auth`,
      auth: { withCredentials: true }
    });
  }

  return pusherInstance;
}

export function getWorkspaceChannels(workspaceId) {
  if (!workspaceId) {
    return null;
  }

  const pusher = getPusherInstance();

  if (!channels.has(workspaceId)) {
    channels.set(workspaceId, {
      private: pusher.subscribe(`private-workspace-${workspaceId}`),
      presence: pusher.subscribe(`presence-workspace-${workspaceId}`)
    });
  }

  return channels.get(workspaceId);
}

export function disconnectWorkspaceChannels(workspaceId) {
  if (!channels.has(workspaceId)) {
    return;
  }

  const pusher = getPusherInstance();
  pusher.unsubscribe(`private-workspace-${workspaceId}`);
  pusher.unsubscribe(`presence-workspace-${workspaceId}`);
  channels.delete(workspaceId);
}
