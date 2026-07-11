import { NextResponse } from "next/server";
import {
  createAdminSessionCookie,
  verifyAdminPassword,
} from "@/app/admin-auth";

export async function POST(request: Request) {
  const form = await request.formData();
  const password = String(form.get("password") ?? "");
  const returnTo = safeReturnPath(String(form.get("return_to") ?? "/admin"));

  if (!(await verifyAdminPassword(password))) {
    return NextResponse.redirect(
      new URL(`/admin/login?error=1&return_to=${encodeURIComponent(returnTo)}`, request.url),
      303,
    );
  }

  const session = await createAdminSessionCookie();
  const response = NextResponse.redirect(new URL(returnTo, request.url), 303);
  response.cookies.set(session.name, session.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV !== "development",
    path: "/",
    maxAge: session.maxAge,
  });
  return response;
}

function safeReturnPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) return "/admin";
  try {
    const url = new URL(value, "https://leeming.local");
    if (url.origin !== "https://leeming.local") return "/admin";
    if (url.pathname === "/admin/login") return "/admin";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/admin";
  }
}
