"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collectTutorialFromForm,
  TutorialEditor,
  type TutorialStepInput,
} from "./tutorial-editor";

type ResourceFormData = Record<string, any> & {
  tutorial?: TutorialStepInput[];
};

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
    body.tutorial = collectTutorialFromForm(form);

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

      <TutorialEditor
        initialSteps={data.tutorial ?? []}
        intro="有些软件需要说明步骤，可以在这里补截图或视频。"
      />

      <div className="form-actions">
        <button className="primary-button">保存修改</button>
      </div>
    </form>
  );
}
