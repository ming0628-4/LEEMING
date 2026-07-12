import { env } from "cloudflare:workers";
import { getLeemingAdmin } from "@/app/admin-auth";

function readKey(params: { key: string[] }) {
  const key = params.key.join("/");
  return key.startsWith("resources/") ? key : null;
}

export async function GET(_: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const key = readKey(await params);
  if (!key) return new Response("Not found", { status: 404 });

  const object = await env.ARCHIVE.get(key);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("content-disposition", `attachment; filename*=UTF-8''${object.customMetadata?.originalName || "download"}`);
  return new Response(object.body, { headers });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ key: string[] }> }) {
  if (!(await getLeemingAdmin())) {
    return Response.json({ error: "仅 LEEMING 管理员可删除文件" }, { status: 403 });
  }

  const key = readKey(await params);
  if (!key) return Response.json({ error: "无效对象键" }, { status: 400 });

  await env.ARCHIVE.delete(key);
  return Response.json({ ok: true });
}
