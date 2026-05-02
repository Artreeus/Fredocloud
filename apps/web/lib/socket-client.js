"use client";

import { io } from "socket.io-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";
const sockets = new Map();

export function getWorkspaceSocket(workspaceId) {
  if (!workspaceId) {
    return null;
  }

  if (!sockets.has(workspaceId)) {
    sockets.set(
      workspaceId,
      io(`${API_BASE_URL}/ws/${workspaceId}`, {
        withCredentials: true,
        transports: ["websocket", "polling"]
      })
    );
  }

  return sockets.get(workspaceId);
}

export function disconnectWorkspaceSocket(workspaceId) {
  const socket = sockets.get(workspaceId);

  if (!socket) {
    return;
  }

  socket.disconnect();
  sockets.delete(workspaceId);
}
