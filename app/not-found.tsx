import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell page">
      <p className="eyebrow">404 · Not Found</p>
      <h1>这里没有这项收藏。</h1>
      <p className="page-lead">
        它可能已经被移动、删除，或者还没有进入 LEEMING 资源库。
      </p>
      <Link className="primary-button" href="/archive">
        返回资源库
      </Link>
    </main>
  );
}
