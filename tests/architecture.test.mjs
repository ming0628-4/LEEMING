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
  assert.match(source, /批量删除/);
  assert.match(source, /已选择/);
  assert.doesNotMatch(source, /[�锛鍒犵绠璧鎼]/);
});

test("admin manager can copy public resource links", async () => {
  const source = await read("components/admin-manager.tsx");
  assert.match(source, /copyPublicLink/);
  assert.match(source, /navigator\.clipboard\.writeText/);
  assert.match(source, /\/item\/\$\{slug\}/);
  assert.match(source, /复制链接/);
});

test("admin manager supports maintenance filters", async () => {
  const source = await read("components/admin-manager.tsx");
  assert.match(source, /tutorialFilter/);
  assert.match(source, /categoryFilter/);
  assert.match(source, /教程状态/);
  assert.match(source, /有教程/);
  assert.match(source, /无教程/);
  assert.match(source, /资源分类/);
});

test("admin manager supports stable resource sorting", async () => {
  const source = await read("components/admin-manager.tsx");
  assert.match(source, /sortMode/);
  assert.match(source, /排序方式/);
  assert.match(source, /最近更新优先/);
  assert.match(source, /按名称排序/);
  assert.match(source, /按分类排序/);
  assert.match(source, /localeCompare/);
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

test("admin resource backup import is administrator-only and visible", async () => {
  const route = await read("app/api/resources/import/route.ts");
  assert.match(route, /getLeemingAdmin/);
  assert.match(route, /onConflictDoUpdate/);
  assert.match(route, /备份文件中没有可导入的资源/);
  const manager = await read("components/admin-manager.tsx");
  assert.match(manager, /导入备份/);
  assert.match(manager, /\/api\/resources\/import/);
  assert.doesNotMatch(manager, /[�锛鍒犵绠璧鎼]/);
});

test("tutorial editor supports readable media replacement flow", async () => {
  const source = await read("components/tutorial-editor.tsx");
  assert.match(source, /操作教程（可选）/);
  assert.match(source, /清空素材/);
  assert.match(source, /重新选择文件会替换当前素材链接/);
  assert.doesNotMatch(source, /[�锛鍒犵绠璧鎼]/);
});

test("tutorial editor supports step ordering without changing the form contract", async () => {
  const source = await read("components/tutorial-editor.tsx");
  assert.match(source, /function moveStep/);
  assert.match(source, /上移/);
  assert.match(source, /下移/);
  assert.match(source, /name="tutorialTitle"/);
  assert.match(source, /name="tutorialMediaUrl"/);
});

test("public home, navigation, and resource forms keep readable Chinese copy", async () => {
  for (const file of [
    "app/page.tsx",
    "components/site-nav.tsx",
    "components/upload-form.tsx",
    "components/edit-resource-form.tsx",
  ]) {
    const source = await read(file);
    assert.doesNotMatch(source, /[�锛鍒犵绠璧鎼]/);
  }
  assert.match(await read("app/page.tsx"), /公开资源库/);
  assert.match(await read("components/site-nav.tsx"), /资源库/);
  assert.match(await read("components/upload-form.tsx"), /发布资源/);
  assert.match(await read("components/edit-resource-form.tsx"), /保存修改/);
});

test("archive, resource cards, item detail, and footer keep readable Chinese copy", async () => {
  for (const file of [
    "app/archive/page.tsx",
    "components/resource-card.tsx",
    "app/item/[slug]/page.tsx",
    "app/layout.tsx",
  ]) {
    const source = await read(file);
    assert.doesNotMatch(source, /[�锛鍒犵绠璧鎼]/);
  }
  assert.match(await read("app/archive/page.tsx"), /全部资源/);
  assert.match(await read("components/resource-card.tsx"), /版本/);
  assert.match(await read("app/item/[slug]/page.tsx"), /获取资源/);
  assert.match(await read("app/layout.tsx"), /管理入口/);
});

test("resource delete cleans primary R2 object and file APIs keep readable copy", async () => {
  const resourceRoute = await read("app/api/resources/[id]/route.ts");
  assert.match(resourceRoute, /env\.ARCHIVE\.delete/);
  assert.match(resourceRoute, /deletedObjectKey/);
  assert.match(resourceRoute, /deletedObjectKeys/);
  assert.match(resourceRoute, /getTutorialObjectKeys/);
  assert.match(resourceRoute, /\/api\/files\//);
  assert.match(resourceRoute, /资源不存在/);

  for (const file of ["app/api/files/route.ts", "app/api/files/[...key]/route.ts"]) {
    const source = await read(file);
    assert.match(source, /LEEMING 管理员/);
    assert.doesNotMatch(source, /[�锛鍒犵绠璧鎼]/);
  }
});
