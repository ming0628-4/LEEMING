import { env } from "cloudflare:workers";
import { eq, sql } from "drizzle-orm";
import { getLeemingAdmin } from "@/app/admin-auth";
import { ensureResourcesTable, getDb } from "@/db";
import { resources } from "@/db/schema";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanTutorial(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((step) => {
      const item = step as Record<string, unknown>;
      const title = clean(item.title);
      const description = clean(item.description);
      const mediaUrl = clean(item.mediaUrl);
      const rawType = clean(item.mediaType);
      const mediaType = rawType === "video" || rawType === "link" ? rawType : "image";
      return { title, description, mediaType, mediaUrl };
    })
    .filter((step) => step.title || step.description || step.mediaUrl);
}

function isResourceObjectKey(value: string | null) {
  return Boolean(value?.startsWith("resources/"));
}

function getInternalFileKey(mediaUrl: string) {
  const marker = "/api/files/";
  const markerIndex = mediaUrl.indexOf(marker);
  if (markerIndex < 0) return null;

  const rawKey = mediaUrl.slice(markerIndex + marker.length).split(/[?#]/)[0];
  if (!rawKey.startsWith("resources/")) return null;

  try {
    return decodeURIComponent(rawKey);
  } catch {
    return rawKey;
  }
}

function getTutorialObjectKeys(tutorial: string) {
  try {
    const steps = JSON.parse(tutorial) as unknown;
    if (!Array.isArray(steps)) return [];

    return steps
      .map((step) => {
        const mediaUrl = clean((step as Record<string, unknown>).mediaUrl);
        return mediaUrl ? getInternalFileKey(mediaUrl) : null;
      })
      .filter((key): key is string => isResourceObjectKey(key));
  } catch {
    return [];
  }
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureResourcesTable();
  const [row] = await getDb()
    .select()
    .from(resources)
    .where(eq(resources.id, Number((await params).id)))
    .limit(1);

  return row
    ? Response.json({
        resource: {
          ...row,
          tags: JSON.parse(row.tags),
          tutorial: JSON.parse(row.tutorial),
        },
      })
    : Response.json({ error: "资源不存在" }, { status: 404 });
}

async function authorized() {
  return Boolean(await getLeemingAdmin());
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorized())) {
    return Response.json({ error: "需要管理员登录" }, { status: 401 });
  }

  await ensureResourcesTable();
  const id = Number((await params).id);
  const body = (await request.json()) as Record<string, unknown>;
  const values: Record<string, unknown> = { updatedAt: sql`CURRENT_TIMESTAMP` };

  for (const key of [
    "name",
    "version",
    "category",
    "description",
    "why",
    "sourceUrl",
    "status",
  ] as const) {
    if (typeof body[key] === "string") values[key] = body[key].trim();
  }

  if (Array.isArray(body.tags)) values.tags = JSON.stringify(body.tags);
  if (Array.isArray(body.tutorial)) values.tutorial = JSON.stringify(cleanTutorial(body.tutorial));

  const [row] = await getDb().update(resources).set(values).where(eq(resources.id, id)).returning();
  return row
    ? Response.json({ resource: row })
    : Response.json({ error: "资源不存在" }, { status: 404 });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorized())) {
    return Response.json({ error: "需要管理员登录" }, { status: 401 });
  }

  await ensureResourcesTable();
  const [row] = await getDb()
    .delete(resources)
    .where(eq(resources.id, Number((await params).id)))
    .returning();

  if (!row) return Response.json({ error: "资源不存在" }, { status: 404 });

  const objectKeys = new Set<string>();
  if (isResourceObjectKey(row.objectKey)) objectKeys.add(row.objectKey!);
  for (const key of getTutorialObjectKeys(row.tutorial)) objectKeys.add(key);

  for (const key of objectKeys) {
    await env.ARCHIVE.delete(key);
  }

  return Response.json({
    ok: true,
    deletedObjectKey: row.objectKey ?? null,
    deletedObjectKeys: [...objectKeys],
    deletedObjectCount: objectKeys.size,
  });
}
