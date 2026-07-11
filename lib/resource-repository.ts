import{desc,eq,like,or}from"drizzle-orm";import{getDb}from"@/db";import{resources}from"@/db/schema";
export type StoredResource=typeof resources.$inferSelect&{tags:string[]};
const map=(r:typeof resources.$inferSelect):StoredResource=>({...r,tags:JSON.parse(r.tags)as string[]});
export async function listResources(q="",category=""){const db=getDb();const where=q?or(like(resources.name,`%${q}%`),like(resources.description,`%${q}%`),like(resources.tags,`%${q}%`)):category?eq(resources.category,category):undefined;return(await db.select().from(resources).where(where).orderBy(desc(resources.updatedAt))).map(map)}
export async function findResource(slug:string){const[row]=await getDb().select().from(resources).where(eq(resources.slug,slug)).limit(1);return row?map(row):null}
