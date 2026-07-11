import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const resources = sqliteTable("resources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  version: text("version").notNull().default(""),
  category: text("category").notNull(),
  tags: text("tags").notNull().default("[]"),
  fileType: text("file_type").notNull().default("LINK"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  sha256: text("sha256"),
  description: text("description").notNull().default(""),
  why: text("why").notNull(),
  sourceUrl: text("source_url").notNull(),
  status: text("status").notNull().default("published"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [uniqueIndex("resources_slug_unique").on(table.slug)]);
