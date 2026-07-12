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

  return row ? Response.json({ ok: true }) : Response.json({ error: "资源不存在" }, { status: 404 });
}
