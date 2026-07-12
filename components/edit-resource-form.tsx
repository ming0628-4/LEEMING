"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type TutorialStep = {
  title: string;
  description: string;
  mediaType: "image" | "video" | "link";
  mediaUrl: string;
};

type ResourceFormData = Record<string, any> & {
  tutorial?: TutorialStep[];
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

export function EditResourceForm({ id }: { id: string }) {
  const router = useRouter();
  const [data, setData] = useState<ResourceFormData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/resources/${id}`)
      .then((response) => response.json())
      .then((payload) =>
        payload.resource
          ? setData({
              ...payload.resource,
              tags: payload.resource.tags.join(", "),
              tutorial: payload.resource.tutorial ?? [],
            })
          : setError(payload.error),
      );
  }, [id]);

  if (error) return <div className="empty">{error}</div>;
  if (!data) return <div className="empty">正在读取...</div>;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body: any = Object.fromEntries(form);
    body.tags = String(body.tags)
      .split(",")
      .map((value: string) => value.trim())
      .filter(Boolean);
    body.tutorial = collectTutorial(form);

    const response = await fetch(`/api/resources/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    if (response.ok) router.push("/admin");
    else setError("保存失败。");
  }

  return (
    <form className="upload-form" onSubmit={submit}>
      <div className="form-grid">
        <label>
          资源名称
          <input name="name" defaultValue={data.name} required />
        </label>
        <label>
          版本
          <input name="version" defaultValue={data.version} />
        </label>
        <label>
          分类
          <input name="category" defaultValue={data.category} required />
        </label>
        <label>
          标签
          <input name="tags" defaultValue={data.tags} />
        </label>
      </div>
      <label>
        简介
        <input name="description" defaultValue={data.description} />
      </label>
      <label>
        来源链接
        <input name="sourceUrl" type="url" defaultValue={data.sourceUrl} required />
      </label>
      <label>
        为什么保留
        <textarea name="why" rows={5} defaultValue={data.why} required />
      </label>

      <TutorialFields steps={data.tutorial ?? []} />

      <div className="form-actions">
        <button className="primary-button">保存修改</button>
      </div>
    </form>
  );
}

function TutorialFields({ steps }: { steps: TutorialStep[] }) {
  return (
    <section className="tutorial-editor">
      <div>
        <p className="eyebrow">操作教程（可选）</p>
        <h2>有些软件需要说明步骤，就在这里补截图或视频。</h2>
        <span>没有教程的资源留空即可，前台不会显示这个模块。</span>
      </div>
      {[0, 1, 2, 3].map((index) => {
        const step = steps[index];
        return (
          <fieldset className="tutorial-step-editor" key={index}>
            <legend>步骤 {index + 1}</legend>
            <div className="form-grid">
              <label>
                步骤标题
                <input name="tutorialTitle" defaultValue={step?.title ?? ""} />
              </label>
              <label>
                媒体类型
                <select name="tutorialMediaType" defaultValue={step?.mediaType ?? "image"}>
                  <option value="image">截图</option>
                  <option value="video">视频</option>
                  <option value="link">链接</option>
                </select>
              </label>
            </div>
            <label>
              步骤说明
              <textarea name="tutorialDescription" rows={3} defaultValue={step?.description ?? ""} />
            </label>
            <label>
              截图 / 视频链接
              <input name="tutorialMediaUrl" type="url" defaultValue={step?.mediaUrl ?? ""} />
            </label>
          </fieldset>
        );
      })}
    </section>
  );
}
