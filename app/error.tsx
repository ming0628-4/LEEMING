"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="shell page">
      <p className="eyebrow">Something Went Wrong</p>
      <h1>暂时无法读取资源库。</h1>
      <p className="page-lead">数据仍然安全，请稍后再试。</p>
      <button className="primary-button" onClick={reset}>
        重新加载
      </button>
    </main>
  );
}
