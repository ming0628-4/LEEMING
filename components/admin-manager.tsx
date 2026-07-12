"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const importInput = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [tutorialFilter, setTutorialFilter] = useState<"all" | "with" | "without">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  async function loadResources() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/resources");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "资源读取失败");
      setRows(payload.resources);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "资源读取失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadResources();
  }, []);

  const filteredRows = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return rows.filter((row) =>
      (tutorialFilter === "all" ||
        (tutorialFilter === "with" && Boolean(row.tutorial?.length)) ||
        (tutorialFilter === "without" && !row.tutorial?.length)) &&
      (categoryFilter === "all" || row.category === categoryFilter) &&
      (!keyword ||
        [row.name, row.category, row.version, row.status, ...(row.tags ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(keyword)),
    );
  }, [categoryFilter, query, rows, tutorialFilter]);

  const categories = useMemo(
    () => Array.from(new Set(rows.map((row) => row.category).filter(Boolean))).sort(),
    [rows],
  );

  const filteredIds = useMemo(() => filteredRows.map((row) => row.id), [filteredRows]);
  const selectedVisibleCount = selectedIds.filter((id) => filteredIds.includes(id)).length;
  const allVisibleSelected = filteredRows.length > 0 && selectedVisibleCount === filteredRows.length;

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

  function toggleOne(id: number) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function toggleVisible() {
    setSelectedIds((current) => {
      if (allVisibleSelected) return current.filter((id) => !filteredIds.includes(id));
      return Array.from(new Set([...current, ...filteredIds]));
    });
  }

  async function deleteIds(ids: number[]) {
    if (!ids.length || busy) return;
    const names = rows.filter((row) => ids.includes(row.id)).map((row) => row.name);
    const message =
      ids.length === 1
        ? `确认删除「${names[0]}」？此操作不可撤销。`
        : `确认删除已选中的 ${ids.length} 个资源？此操作不可撤销。`;
    if (!confirm(message)) return;

    setBusy(true);
    setError("");
    setNotice("");
    try {
      for (const id of ids) {
        const response = await fetch(`/api/resources/${id}`, { method: "DELETE" });
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "删除失败，请刷新后重试。");
        }
      }

      setRows((current) => current.filter((item) => !ids.includes(item.id)));
      setSelectedIds((current) => current.filter((id) => !ids.includes(id)));
      setNotice(`已删除 ${ids.length} 个资源。`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "删除失败，请刷新后重试。");
    } finally {
      setBusy(false);
    }
  }

  async function importBackup(file?: File) {
    if (!file || busy) return;
    if (!confirm("确认导入这个备份文件？同 slug 的资源会被更新，不会清空现有资源。")) return;

    setBusy(true);
    setError("");
    setNotice("");
    try {
      const payload = JSON.parse(await file.text());
      const response = await fetch("/api/resources/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "导入失败，请检查备份文件。");

      setNotice(`导入完成：${result.imported} 条成功，${result.skipped} 条跳过。`);
      await loadResources();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "导入失败，请检查备份文件。");
    } finally {
      setBusy(false);
      if (importInput.current) importInput.current.value = "";
    }
  }

  async function copyPublicLink(slug: string) {
    const url = `${window.location.origin}/item/${slug}`;

    try {
      await navigator.clipboard.writeText(url);
      setNotice("公开链接已复制，可以直接粘贴分享。");
      setError("");
    } catch {
      setError(`复制失败，可以手动复制：${url}`);
      setNotice("");
    }
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
          <a className="secondary-button" href="/api/resources/export">
            导出备份
          </a>
          <button className="secondary-button" type="button" disabled={busy} onClick={() => importInput.current?.click()}>
            导入备份
          </button>
          <input
            ref={importInput}
            className="sr-only"
            type="file"
            accept="application/json,.json"
            onChange={(event) => importBackup(event.target.files?.[0])}
          />
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
      {notice ? <div className="empty success-state">{notice}</div> : null}

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
        <label>
          <span>教程状态</span>
          <select
            value={tutorialFilter}
            onChange={(event) => setTutorialFilter(event.target.value as "all" | "with" | "without")}
          >
            <option value="all">全部资源</option>
            <option value="with">有教程</option>
            <option value="without">无教程</option>
          </select>
        </label>
        <label>
          <span>资源分类</span>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            <option value="all">全部分类</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <span>
          当前显示 {filteredRows.length} / {rows.length}
        </span>
      </div>

      {selectedIds.length ? (
        <div className="bulk-bar">
          <span>已选择 {selectedIds.length} 个资源</span>
          <button className="danger-button" type="button" disabled={busy} onClick={() => deleteIds(selectedIds)}>
            {busy ? "正在删除..." : "批量删除"}
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="empty" aria-live="polite">
          正在读取资源...
        </div>
      ) : rows.length === 0 ? (
        <div className="empty">还没有资源。先上传第一条真正值得长期保留的内容。</div>
      ) : filteredRows.length === 0 ? (
        <div className="empty">没有匹配的资源，可以换一个关键词试试。</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    aria-label="选择当前显示的资源"
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleVisible}
                  />
                </th>
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
                    <input
                      aria-label={`选择 ${row.name}`}
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleOne(row.id)}
                    />
                  </td>
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
                    <button className="secondary-button compact-button" type="button" onClick={() => copyPublicLink(row.slug)}>
                      复制链接
                    </button>
                    <Link href={`/admin/edit/${row.id}`}>编辑</Link>
                    <button className="danger-button" disabled={busy} onClick={() => deleteIds([row.id])}>
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
