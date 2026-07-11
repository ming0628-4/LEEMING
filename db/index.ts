import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  return drizzle(env.DB, { schema });
}

export async function ensureResourcesTable() {
  if (!env.DB) throw new Error("Cloudflare D1 binding `DB` is unavailable.");
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS resources (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL, name TEXT NOT NULL, version TEXT NOT NULL DEFAULT '', category TEXT NOT NULL, tags TEXT NOT NULL DEFAULT '[]', file_type TEXT NOT NULL DEFAULT 'LINK', file_name TEXT, file_size INTEGER, sha256 TEXT, description TEXT NOT NULL DEFAULT '', why TEXT NOT NULL, source_url TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'published', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`),
    env.DB.prepare("CREATE UNIQUE INDEX IF NOT EXISTS resources_slug_unique ON resources (slug)"),
  ]);
}
