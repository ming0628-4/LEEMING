import { getLeemingAdmin } from "@/app/admin-auth";
import { listResources } from "@/lib/resource-repository";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getLeemingAdmin())) {
    return Response.json({ error: "需要管理员登录" }, { status: 401 });
  }

  const resources = await listResources();
  const exportedAt = new Date().toISOString();

  return Response.json(
    {
      product: "LEEMING",
      type: "resource-metadata-backup",
      exportedAt,
      count: resources.length,
      resources,
    },
    {
      headers: {
        "Content-Disposition": `attachment; filename="leeming-resources-${exportedAt.slice(0, 10)}.json"`,
      },
    },
  );
}
