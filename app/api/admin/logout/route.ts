import { NextResponse } from "next/server";
import { expiredAdminSessionCookie } from "@/app/admin-auth";

export async function POST(request: Request) {
  const session = expiredAdminSessionCookie();
  const response = NextResponse.redirect(new URL("/admin/login", request.url), 303);
  response.cookies.set(session.name, session.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV !== "development",
    path: "/",
    maxAge: session.maxAge,
  });
  return response;
}
