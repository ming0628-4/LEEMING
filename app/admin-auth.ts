import { notFound, redirect } from "next/navigation";
import {
  chatGPTSignInPath,
  getChatGPTUser,
  type ChatGPTUser,
} from "./chatgpt-auth";

function isLeemingAdmin(user: ChatGPTUser): boolean {
  if (process.env.NODE_ENV === "development" && user.email === "local@leeming.dev") {
    return true;
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  return Boolean(adminEmail && user.email.toLowerCase() === adminEmail);
}

export async function getLeemingAdmin(): Promise<ChatGPTUser | null> {
  const user = await getChatGPTUser();
  if (!user) return null;

  return isLeemingAdmin(user) ? user : null;
}

export async function requireLeemingAdmin(returnTo = "/admin"): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (!user) redirect(chatGPTSignInPath(returnTo));
  if (!isLeemingAdmin(user)) notFound();

  return user;
}
