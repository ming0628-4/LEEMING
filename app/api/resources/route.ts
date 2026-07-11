import { desc, eq, like, or } from "drizzle-orm";
import { ensureResourcesTable, getDb } from "@/db";
import { resources } from "@/db/schema";
import { getLeemingAdmin } from "@/app/admin-auth";

function clean(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function slugify(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-"); }

export async function GET(request: Request) {
  await ensureResourcesTable();
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const db = getDb();
  const rows = q ? await db.select().from(resources).where(or(like(resources.name, `%${q}%`), like(resources.description, `%${q}%`), like(resources.tags, `%${q}%`))).orderBy(desc(resources.updatedAt)) : await db.select().from(resources).orderBy(desc(resources.updatedAt));
  return Response.json({ resources: rows.map(row => ({ ...row, tags: JSON.parse(row.tags) })) });
}

export async function POST(request: Request) {
  if (!(await getLeemingAdmin())) return Response.json({ error: "仅 LEEMING 管理员可执行此操作" }, { status: 403 });
  await ensureResourcesTable();
  const body = await request.json() as Record<string, unknown>;
  const name = clean(body.name); const why = clean(body.why); const category = clean(body.category); const sourceUrl = clean(body.sourceUrl);
  if (!name || !why || !category || !sourceUrl) return Response.json({ error: "名称、保留理由、分类和来源链接不能为空" }, { status: 400 });
  const tags = Array.isArray(body.tags) ? body.tags.map(clean).filter(Boolean) : clean(body.tags).split(",").map(v => v.trim()).filter(Boolean);
  const db = getDb();
  try { const [resource] = await db.insert(resources).values({ slug: clean(body.slug) || slugify(name), name, why, category, sourceUrl, version: clean(body.version), description: clean(body.description), fileType: clean(body.fileType) || "LINK", fileName: clean(body.fileName) || null, fileSize: Number(body.fileSize) || null, sha256: clean(body.sha256) || null, objectKey: clean(body.objectKey) || null, tags: JSON.stringify(tags) }).returning(); return Response.json({ resource }, { status: 201 }); }
  catch { return Response.json({ error: "资源标识已存在，请修改名称或 slug" }, { status: 409 }); }
}
