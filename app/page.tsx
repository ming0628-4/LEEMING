import Link from "next/link";
import { ResourceCard } from "@/components/resource-card";
import { listResources } from "@/lib/resource-repository";

function formatSize(size: number | null) {
  if (!size) return "External";
  if (size < 1048576) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1048576).toFixed(1)} MB`;
}

export default async function Home() {
  const resources = await listResources();
  const latest = resources.slice(0, 4).map((resource) => ({
    ...resource,
    size: formatSize(resource.fileSize),
  }));
  const categoryCount = new Set(resources.map((resource) => resource.category)).size;
  const lastUpdated = resources[0]?.updatedAt ?? "持续维护";

  return (
    <main>
      <section className="home-hero shell">
        <div className="home-kicker">
          <span>LEEMING</span>
          <span>Personal Digital Archive</span>
        </div>
        <div className="home-hero-grid">
          <div className="home-copy">
            <p className="eyebrow">公开资料库</p>
            <h1>把真正有用的东西，放在以后还能找到的地方。</h1>
            <p className="hero-copy">
              LEEMING 是一个长期维护的个人资源库。这里不追求数量，只保留经过筛选、说明清楚、需要时能快速取回的资料。
            </p>
            <form action="/archive" className="hero-search">
              <label className="sr-only" htmlFor="home-search">
                搜索资源
              </label>
              <input
                id="home-search"
                name="q"
                placeholder="搜索名称、用途、标签..."
                autoComplete="off"
              />
              <button type="submit">搜索</button>
            </form>
          </div>
          <aside className="home-panel" aria-label="资料库状态">
            <div>
              <span>资源</span>
              <strong>{resources.length}</strong>
            </div>
            <div>
              <span>分类</span>
              <strong>{categoryCount}</strong>
            </div>
            <div>
              <span>最近更新</span>
              <strong>{lastUpdated}</strong>
            </div>
            <Link href="/archive">进入资源库</Link>
          </aside>
        </div>
      </section>

      <section className="shell section">
        <div className="section-head">
          <div>
            <p className="eyebrow">Recently Kept</p>
            <h2>最近保留</h2>
          </div>
          <Link href="/archive">查看全部资源</Link>
        </div>
        <div className="resource-grid compact-grid">
          {latest.map((resource) => (
            <ResourceCard key={resource.slug} resource={resource} />
          ))}
        </div>
      </section>

      <section className="shell principle">
        <p>选择标准</p>
        <h2>如果它不能帮助未来的自己更快找到答案，就不进入 LEEMING。</h2>
        <span>少一点、准一点、长期可维护。</span>
      </section>
    </main>
  );
}
