import Link from "next/link";
import { ResourceCard } from "@/components/resource-card";
import { listCategories, listResources } from "@/lib/resource-repository";

export const metadata = { title: "资源库" };

function formatSize(size: number | null) {
  if (!size) return "外部链接";
  if (size < 1048576) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1048576).toFixed(1)} MB`;
}

export default async function Archive({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category = "" } = await searchParams;
  const [rows, categories] = await Promise.all([
    listResources(q, category),
    listCategories(),
  ]);

  const resources = rows.map((resource) => ({
    ...resource,
    size: formatSize(resource.fileSize),
  }));

  return (
    <main className="shell page">
      <p className="eyebrow">The Archive</p>
      <div className="archive-title">
        <div>
          <h1>全部资源</h1>
          <p className="page-lead">
            这里保存的是经过筛选、能说明用途、后续还值得维护的资源。
          </p>
        </div>
        <Link href="/">返回首页</Link>
      </div>

      <form className="filter-bar">
        <input
          name="q"
          defaultValue={q}
          placeholder="搜索名称、用途或标签..."
          aria-label="搜索资源"
        />
        <select name="category" defaultValue={category} aria-label="按分类筛选">
          <option value="">所有分类</option>
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <button>筛选</button>
      </form>

      <div className="result-line">
        <span>{resources.length} 个结果</span>
        {q || category ? <Link href="/archive">清除筛选</Link> : null}
      </div>

      <div className="resource-grid">
        {resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
      {!resources.length ? (
        <div className="empty">没有匹配资源。可以清除筛选，或换一个关键词。</div>
      ) : null}
    </main>
  );
}
