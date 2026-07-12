import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("public pages use the D1 resource repository", async () => {
  const sources = await Promise.all([
    read("app/page.tsx"),
    read("app/archive/page.tsx"),
    read("app/item/[slug]/page.tsx"),
  ]);
  for (const source of sources) {
    assert.match(source, /Resource|listResources|findResource/);
    assert.doesNotMatch(source, /lib\/resources/);
  }
});

test("all admin pages require LEEMING admin session", async () => {
  for (const file of [
    "app/admin/page.tsx",
    "app/admin/upload/page.tsx",
    "app/admin/edit/[id]/page.tsx",
  ]) {
    const source = await read(file);
    assert.match(source, /requireLeemingAdmin/);
    assert.match(source, /force-dynamic/);
  }
});

test("all write and backup APIs require LEEMING admin session", async () => {
  for (const file of [
    "app/api/resources/route.ts",
    "app/api/resources/[id]/route.ts",
    "app/api/resources/export/route.ts",
    "app/api/files/route.ts",
    "app/api/files/[...key]/route.ts",
  ]) {
    assert.match(await read(file), /getLeemingAdmin/);
  }
});

test("D1 and R2 deployment declarations and migrations exist", async () => {
  const hosting = JSON.parse(await read(".openai/hosting.json"));
  assert.equal(hosting.d1, "DB");
  assert.equal(hosting.r2, "ARCHIVE");
  await Promise.all([
    access(new URL("../drizzle/0000_opposite_alice.sql", import.meta.url)),
    access(new URL("../drizzle/0002_add_object_key.sql", import.meta.url)),
  ]);
});

test("admin pages use LEEMING password session instead of ChatGPT login", async () => {
  const source = await read("app/admin-auth.ts");
  assert.match(source, /ADMIN_SESSION_COOKIE/);
  assert.match(source, /adminLoginPath/);
  assert.doesNotMatch(source, /chatGPTSignInPath|signin-with-chatgpt|getChatGPTUser/);
});

test("public navigation does not expose admin login", async () => {
  const source = await read("components/site-nav.tsx");
  assert.doesNotMatch(source, /href:"\/admin"/);
  assert.doesNotMatch(source, /label:"Admin"/);
});

test("resource tutorials are persisted and rendered as optional item content", async () => {
  assert.match(await read("db/schema.ts"), /tutorial/);
  await access(new URL("../drizzle/0003_add_tutorial.sql", import.meta.url));
  assert.match(await read("app/item/[slug]/page.tsx"), /tutorial-section/);
  assert.match(await read("components/tutorial-editor.tsx"), /添加步骤/);
  assert.match(await read("components/tutorial-editor.tsx"), /api\/files/);
});

test("legacy ChatGPT auth helper has been removed", async () => {
  await assert.rejects(() => access(new URL("../app/chatgpt-auth.ts", import.meta.url)));
});

test("admin manager keeps readable Chinese copy", async () => {
  const source = await read("components/admin-manager.tsx");
  assert.match(source, /资源管理/);
  assert.match(source, /上传资源/);
  assert.match(source, /确认删除/);
  assert.doesNotMatch(source, /[�锛鍒犵绠璧鎼]/);
});

test("admin resource backup export is administrator-only and visible", async () => {
  const route = await read("app/api/resources/export/route.ts");
  assert.match(route, /resource-metadata-backup/);
  assert.match(route, /Content-Disposition/);
  assert.match(route, /getLeemingAdmin/);
  const manager = await read("components/admin-manager.tsx");
  assert.match(manager, /导出备份/);
  assert.match(manager, /\/api\/resources\/export/);
});
