import { sql } from "drizzle-orm";
import { getLeemingAdmin } from "@/app/admin-auth";
import { ensureResourcesTable, getDb } from "@/db";
import { resources } from "@/db/schema";

type BackupResource = Record<string, unknown> & {
  slug?: string;
  name?: string;
  category?: string;
  why?: string;
  sourceUrl?: string;
  tags?: unknown[];
  tutorial?: unknown[];
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function cleanArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function pickResources(payload: unknown): BackupResource[] {
  if (!payload || typeof payload !== "object") return [];
  const value = (payload as Record<string, unknown>).resources;
  return Array.isArray(value) ? (value as BackupResource[]) : [];
}

function normalizeResource(item: BackupResource) {
  const slug = clean(item.slug);
  const name = clean(item.name);
  const category = clean(item.category);
  const why = clean(item.why);
  const sourceUrl = clean(item.sourceUrl);

  if (!slug || !name || !category || !why || !sourceUrl) return null;

  return {
    slug,
    name,
    category,
    why,
    sourceUrl,
    version: clean(item.version),
    description: clean(item.description),
    fileType: clean(item.fileType) || "LINK",
    fileName: clean(item.fileName) || null,
    fileSize: cleanNumber(item.fileSize),
    sha256: clean(item.sha256) || null,
    objectKey: clean(item.objectKey) || null,
    status: clean(item.status) || "published",
    tags: JSON.stringify(cleanArray(item.tags)),
    tutorial: JSON.stringify(cleanArray(item.tutorial)),
    updatedAt: sql`CURRENT_TIMESTAMP`,
  };
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await getLeemingAdmin())) {
    return Response.json({ error: "需要管理员登录" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const backupResources = pickResources(payload);
  if (!backupResources.length) {
    return Response.json({ error: "备份文件中没有可导入的资源" }, { status: 400 });
  }

  await ensureResourcesTable();
  const db = getDb();
  let imported = 0;
  let skipped = 0;

  for (const item of backupResources) {
    const value = normalizeResource(item);
    if (!value) {
      skipped += 1;
      continue;
    }

    await db
      .insert(resources)
      .values(value)
      .onConflictDoUpdate({
        target: resources.slug,
        set: {
          name: value.name,
          category: value.category,
          why: value.why,
          sourceUrl: value.sourceUrl,
          version: value.version,
          description: value.description,
          fileType: value.fileType,
          fileName: value.fileName,
          fileSize: value.fileSize,
          sha256: value.sha256,
          objectKey: value.objectKey,
          status: value.status,
          tags: value.tags,
          tutorial: value.tutorial,
          updatedAt: sql`CURRENT_TIMESTAMP`,
        },
      });
    imported += 1;
  }

  return Response.json({ ok: true, imported, skipped });
}
