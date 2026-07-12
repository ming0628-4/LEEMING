"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Row = {
  id: number;
  name: string;
  category: string;
  version: string;
  updatedAt: string;
  status: string;
  tags?: string[];
  tutorial?: unknown[];
};

export function AdminManager() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/resources")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error);
        setRows(payload.resources);
      })
      .catch((reason) => setError(reason.message))
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

  async function remove(id: number, name: string) {
    if (!confirm(`确认删除「${name}」？此操作不可撤销。`)) return;

    const response = await fetch(`/api/resources/${id}`, { method: "DELETE" });
    if (response.ok) {
      setRows((current) => current.filter((item) => item.id !== id));
      return;
    }

    setError("删除失败，请重试。");
  }

  return (
    <>
      <div className="section-head">
        <div>
          <p className="eyebrow">Admin Mode</p>
          <h1>资源管理</h1>
          <p className="page-lead">维护与前台共用的资源数据库。</p>
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
          <strong>{rows.length}</strong>
          <span>全部资源</span>
        </div>
        <div>
          <strong>{new Set(rows.map((row) => row.category)).size}</strong>
          <span>分类</span>
        </div>
        <div>
          <strong>{rows.filter((row) => row.tutorial?.length).length}</strong>
          <span>带教程</span>
        </div>
      </div>

      <div className="admin-toolbar">
        <label>
          <span>搜索资源</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="按名称、分类、标签搜索"
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
        <div className="empty">暂无资源。上传第一条值得长期保留的内容。</div>
      ) : filteredRows.length === 0 ? (
        <div className="empty">没有匹配的资源，可以换个关键词。</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>资源</th>
                <th>分类</th>
                <th>版本</th>
                <th>教程</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.category}</td>
                  <td>{row.version || "未标注"}</td>
                  <td>{row.tutorial?.length ? `${row.tutorial.length} 步` : "无"}</td>
                  <td>{row.updatedAt}</td>
                  <td className="table-actions">
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
