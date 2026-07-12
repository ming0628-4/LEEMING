"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Row = {
  id: number;
  slug: string;
  name: string;
  category: string;
  version: string;
  updatedAt: string;
  status: string;
  tags?: string[];
  tutorial?: unknown[];
};

function formatDate(value: string) {
  if (!value) return "暂无记录";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium" }).format(date);
}

export function AdminManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/resources")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "资源读取失败");
        setRows(payload.resources);
      })
      .catch((reason) => setError(reason.message || "资源读取失败，请稍后重试。"))
      .finally(() => setLoading(false));
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter((row) =>
      [row.name, row.category, row.version, row.status, ...(row.tags ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [query, rows]);

  const stats = useMemo(() => {
    const categories = new Set(rows.map((row) => row.category).filter(Boolean));
    const tutorialCount = rows.filter((row) => row.tutorial?.length).length;
    const latest = rows
      .map((row) => row.updatedAt)
      .filter(Boolean)
      .sort()
      .at(-1);

    return {
      total: rows.length,
      categories: categories.size,
      tutorialCount,
      latest: latest ? formatDate(latest) : "暂无记录",
    };
  }, [rows]);

  async function remove(id: number, name: string) {
    if (!confirm(`确认删除「${name}」？此操作不可撤销。`)) return;

    const response = await fetch(`/api/resources/${id}`, { method: "DELETE" });
    if (response.ok) {
      setRows((current) => current.filter((item) => item.id !== id));
      return;
    }

    setError("删除失败，请刷新后重试。");
  }

  return (
    <>
      <div className="section-head">
        <div>
          <p className="eyebrow">Admin Console</p>
          <h1>资源管理</h1>
          <p className="page-lead">
            这里是 LEEMING 的唯一写入入口。普通用户无需登录，只负责浏览和下载。
          </p>
        </div>
        <div className="admin-actions">
          <Link className="primary-button" href="/admin/upload">
            上传资源
          </Link>
          <form action="/api/admin/logout" method="post">
            <button className="secondary-button" type="submit">
              退出登录
            </button>
          </form>
        </div>
      </div>

      {error ? (
        <div className="empty" role="alert">
          {error}
        </div>
      ) : null}

      <div className="admin-stats">
        <div>
          <span>全部资源</span>
          <strong>{stats.total}</strong>
        </div>
        <div>
          <span>资源分类</span>
          <strong>{stats.categories}</strong>
        </div>
        <div>
          <span>带教程资源</span>
          <strong>{stats.tutorialCount}</strong>
        </div>
        <div>
          <span>最近更新</span>
          <strong>{stats.latest}</strong>
        </div>
      </div>

      <div className="admin-toolbar">
        <label>
          <span>搜索资源</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="输入名称、分类、版本或标签"
          />
        </label>
        <span>
          当前显示 {filteredRows.length} / {rows.length}
        </span>
      </div>

      {loading ? (
        <div className="empty" aria-live="polite">
          正在读取资源...
        </div>
      ) : rows.length === 0 ? (
        <div className="empty">
          还没有资源。先上传第一条真正值得长期保留的内容。
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="empty">没有匹配的资源，可以换一个关键词试试。</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>资源</th>
                <th>分类</th>
                <th>版本</th>
                <th>教程</th>
                <th>更新日期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                  </td>
                  <td>{row.category || "未分类"}</td>
                  <td>{row.version || "未标注"}</td>
                  <td>{row.tutorial?.length ? `${row.tutorial.length} 步` : "无"}</td>
                  <td>{formatDate(row.updatedAt)}</td>
                  <td className="table-actions">
                    <Link href={`/item/${row.slug}`} className="muted-link">
                      预览
                    </Link>
                    <Link href={`/admin/edit/${row.id}`}>编辑</Link>
                    <button className="danger-button" onClick={() => remove(row.id, row.name)}>
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
