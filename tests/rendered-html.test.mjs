import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("首页呈现 LEEMING 产品入口", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /LEEMING/);
  assert.match(html, /PERSONAL DIGITAL ARCHIVE/);
  assert.match(html, /最近保留/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});

test("关键路由可由服务端正常呈现", async () => {
  for (const [path, marker] of [["/archive", "所有资源"], ["/admin", "资源管理"], ["/admin/upload", "上传资源"], ["/item/everything", "WHY I KEEP IT"]]) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), new RegExp(marker), path);
  }
});
