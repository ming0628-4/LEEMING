import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type LeemingAdmin = {
  name: "LEEMING Admin";
};

export const ADMIN_SESSION_COOKIE = "leeming_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 14;

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "";
}

export function hasAdminPasswordConfigured() {
  return getAdminPassword().length >= 12 && getSessionSecret().length >= 12;
}

export function adminLoginPath(returnTo = "/admin") {
  const safeReturnTo = safeRelativeReturnPath(returnTo);
  return `/admin/login?return_to=${encodeURIComponent(safeReturnTo)}`;
}

export async function verifyAdminPassword(password: string) {
  const configured = getAdminPassword();
  if (!hasAdminPasswordConfigured()) return false;
  return timingSafeEqual(password, configured);
}

export async function createAdminSessionCookie() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload = `admin.${expires}`;
  const signature = await sign(payload);
  return {
    name: ADMIN_SESSION_COOKIE,
    value: `${payload}.${signature}`,
    maxAge: SESSION_MAX_AGE,
  };
}

export function expiredAdminSessionCookie() {
  return {
    name: ADMIN_SESSION_COOKIE,
    value: "",
    maxAge: 0,
  };
}

export async function getLeemingAdmin(): Promise<LeemingAdmin | null> {
  if (process.env.NODE_ENV === "development" && !hasAdminPasswordConfigured()) {
    return { name: "LEEMING Admin" };
  }

  const session = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!session || !(await verifySession(session))) return null;
  return { name: "LEEMING Admin" };
}

export async function requireLeemingAdmin(returnTo = "/admin"): Promise<LeemingAdmin> {
  const admin = await getLeemingAdmin();
  if (admin) return admin;
  redirect(adminLoginPath(returnTo));
}

function safeRelativeReturnPath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/admin";

  let url: URL;
  try {
    url = new URL(value, "https://leeming.local");
  } catch {
    return "/admin";
  }

  if (url.origin !== "https://leeming.local") return "/admin";
  if (url.pathname === "/admin/login") return "/admin";

  return `${url.pathname}${url.search}${url.hash}`;
}

async function verifySession(value: string) {
  const parts = value.split(".");
  if (parts.length !== 3) return false;

  const [subject, expiresRaw, signature] = parts;
  if (subject !== "admin") return false;

  const expires = Number(expiresRaw);
  if (!Number.isFinite(expires) || expires < Math.floor(Date.now() / 1000)) {
    return false;
  }

  const payload = `${subject}.${expiresRaw}`;
  const expected = await sign(payload);
  return timingSafeEqual(signature, expected);
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64Url(signature);
}

function base64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function timingSafeEqual(left: string, right: string) {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  if (leftBytes.length !== rightBytes.length) return false;

  let diff = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    diff |= leftBytes[index] ^ rightBytes[index];
  }
  return diff === 0;
}
