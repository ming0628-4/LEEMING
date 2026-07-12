"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Info = { fileName: string; fileSize: number; fileType: string; sha256: string };
type Phase = "idle" | "hashing" | "uploading" | "saving";

const phaseText: Record<Phase, string> = {
  idle: "发布资源",
  hashing: "正在计算 SHA256...",
  uploading: "正在上传文件...",
  saving: "正在保存资源信息...",
};

function collectTutorial(form: FormData) {
  const titles = form.getAll("tutorialTitle").map(String);
  const descriptions = form.getAll("tutorialDescription").map(String);
  const mediaTypes = form.getAll("tutorialMediaType").map(String);
  const mediaUrls = form.getAll("tutorialMediaUrl").map(String);

  return titles
    .map((title, index) => ({
      title: title.trim(),
      description: descriptions[index]?.trim() ?? "",
      mediaType: mediaTypes[index] === "video" || mediaTypes[index] === "link" ? mediaTypes[index] : "image",
      mediaUrl: mediaUrls[index]?.trim() ?? "",
    }))
    .filter((step) => step.title || step.description || step.mediaUrl);
}

export function UploadForm() {
  const router = useRouter();
  const [selected, setSelected] = useState<File | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const busy = phase !== "idle";

  async function pick(file?: File) {
    if (!file) return;
    setPhase("hashing");
    setError("");

    try {
      const hash = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
      setSelected(file);
      setInfo({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.name.split(".").pop()?.toUpperCase() || "FILE",
        sha256: [...new Uint8Array(hash)]
          .map((byte) => byte.toString(16).padStart(2, "0"))
          .join(""),
      });
    } catch {
      setError("无法读取该文件，请重新选择。");
    } finally {
      setPhase("idle");
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let objectKey = "";
    setError("");

    try {
      if (selected) {
        setPhase("uploading");
        const fileForm = new FormData();
        fileForm.set("file", selected);
        const response = await fetch("/api/files", { method: "POST", body: fileForm });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error);
        objectKey = payload.key;
      }

      setPhase("saving");
      const form = new FormData(event.currentTarget);
      const data = Object.fromEntries(form);
      const sourceUrl = String(data.sourceUrl || "") || (objectKey ? `/api/files/${objectKey}` : "");

      const response = await fetch("/api/resources", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...data,
          ...info,
          objectKey,
          sourceUrl,
          tutorial: collectTutorial(form),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      router.push("/admin");
    } catch (reason) {
      if (objectKey) await fetch(`/api/files/${objectKey}`, { method: "DELETE" }).catch(() => undefined);
      setError(reason instanceof Error ? reason.message : "上传失败。");
    } finally {
      setPhase("idle");
    }
  }

  return (
    <form className="upload-form" onSubmit={submit}>
      <label className="dropzone">
        <input type="file" disabled={busy} onChange={(event) => pick(event.target.files?.[0])} />
        <strong>{phase === "hashing" ? phaseText.hashing : info?.fileName || "拖入文件，或点击选择"}</strong>
        <span>
          {info
            ? `${(info.fileSize / 1048576).toFixed(2)} MB · ${info.fileType} · SHA256 ${info.sha256.slice(0, 12)}...`
            : "可选。上传软件安装包时会自动读取文件信息和 SHA256。"}
        </span>
      </label>

      <div className="form-grid">
        <label>
          资源名称
          <input name="name" required />
        </label>
        <label>
          版本
          <input name="version" />
        </label>
        <label>
          分类
          <input name="category" required />
        </label>
        <label>
          标签
          <input name="tags" placeholder="多个标签用逗号分隔" />
        </label>
      </div>

      <label>
        简介
        <input name="description" />
      </label>
      <label>
        外部来源链接（上传文件时可留空）
        <input name="sourceUrl" type="url" />
      </label>
      <label>
        为什么保留
        <textarea name="why" rows={5} required />
      </label>

      <TutorialFields />

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="primary-button" disabled={busy}>
        {phaseText[phase]}
      </button>
    </form>
  );
}

function TutorialFields() {
  return (
    <section className="tutorial-editor">
      <div>
        <p className="eyebrow">操作教程（可选）</p>
        <h2>需要截图或视频说明的软件，可以在这里补步骤。</h2>
        <span>没有教程的资源不用填。媒体链接可以先放图片地址、B 站视频、网盘预览页或自己的视频链接。</span>
      </div>
      {[0, 1, 2, 3].map((index) => (
        <fieldset className="tutorial-step-editor" key={index}>
          <legend>步骤 {index + 1}</legend>
          <div className="form-grid">
            <label>
              步骤标题
              <input name="tutorialTitle" placeholder="例如：下载并安装" />
            </label>
            <label>
              媒体类型
              <select name="tutorialMediaType" defaultValue="image">
                <option value="image">截图</option>
                <option value="video">视频</option>
                <option value="link">链接</option>
              </select>
            </label>
          </div>
          <label>
            步骤说明
            <textarea name="tutorialDescription" rows={3} placeholder="写清楚这一步怎么操作。" />
          </label>
          <label>
            截图 / 视频链接
            <input name="tutorialMediaUrl" type="url" placeholder="https://..." />
          </label>
        </fieldset>
      ))}
    </section>
  );
}
