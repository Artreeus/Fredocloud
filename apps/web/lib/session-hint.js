const SESSION_HINT_COOKIE = "fredocloud_session_hint";

export function setSessionHintCookie() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${SESSION_HINT_COOKIE}=1; Path=/; Max-Age=604800; SameSite=Lax; Secure`;
}

export function clearSessionHintCookie() {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${SESSION_HINT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
}

export function getSessionHintCookieName() {
  return SESSION_HINT_COOKIE;
}
