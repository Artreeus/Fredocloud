const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

let refreshPromise = null;

async function attemptRefresh() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include"
    }).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function apiRequest(path, options = {}, shouldRetry = true) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {})
    }
  });

  if (response.status === 401 && shouldRetry && path !== "/api/auth/refresh") {
    const refreshResponse = await attemptRefresh();

    if (refreshResponse.ok) {
      return apiRequest(path, options, false);
    }
  }

  if (!response.ok) {
    let message = "Something went wrong";

    try {
      const payload = await response.json();
      message = payload.message || message;
    } catch {
      // Ignore malformed JSON and use default message.
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}
