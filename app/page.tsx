import Link from "next/link";
import { ResourceCard } from "@/components/resource-card";
import { categories, resources } from "@/lib/resources";

export default function Home() {
  const latest = resources.slice(0, 3);
  return (
    <main>
      <section className="hero shell">
        <p className="eyebrow">PERSONAL DIGITAL ARCHIVE</p>
        <h1>把值得留下的东西，<br />放回伸手可及的地方。</h1>
        <p className="hero-copy">LEEMING 是一座持续维护的个人数字资源库。收藏、整理、找回，再在需要时重新获得。</p>
        <form action="/archive" className="hero-search">
          <label className="sr-only" htmlFor="home-search">搜索资源</label>
          <input id="home-search" name="q" placeholder="搜索名称、用途或标签…" />
          <button type="submit">搜索 Archive</button>
        </form>
        <div className="hero-meta"><span>{resources.length} 个资源</span><span>{categories.length} 个分类</span><span>持续维护中</span></div>
      </section>

      <section className="shell section">
        <div className="section-head"><div><p className="eyebrow">RECENTLY KEPT</p><h2>最近保留</h2></div><Link href="/archive">查看全部 →</Link></div>
        <div className="resource-grid">{latest.map((resource) => <ResourceCard key={resource.slug} resource={resource} />)}</div>
      </section>

      <section className="shell principle">
        <p>“</p><h2>它有没有帮助未来的自己，更快找到资源？</h2><span>如果没有，就不保留。</span>
      </section>
    </main>
  );
}
