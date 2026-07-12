"use client";

import { useState } from "react";

export type TutorialStepInput = {
  title: string;
  description: string;
  mediaType: "image" | "video" | "link";
  mediaUrl: string;
};

const emptyStep: TutorialStepInput = {
  title: "",
  description: "",
  mediaType: "image",
  mediaUrl: "",
};

export function collectTutorialFromForm(form: FormData) {
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

export function TutorialEditor({
  initialSteps = [],
  intro,
}: {
  initialSteps?: TutorialStepInput[];
  intro: string;
}) {
  const [steps, setSteps] = useState<TutorialStepInput[]>(
    initialSteps.length ? initialSteps : [],
  );
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [error, setError] = useState("");

  function addStep() {
    setSteps((current) => [...current, { ...emptyStep }]);
  }

  function removeStep(index: number) {
    setSteps((current) => current.filter((_, stepIndex) => stepIndex !== index));
  }

  function updateStep(index: number, patch: Partial<TutorialStepInput>) {
    setSteps((current) =>
      current.map((step, stepIndex) =>
        stepIndex === index ? { ...step, ...patch } : step,
      ),
    );
  }

  function clearMedia(index: number) {
    updateStep(index, { mediaUrl: "", mediaType: "image" });
  }

  async function uploadMedia(index: number, file?: File) {
    if (!file) return;
    setUploadingIndex(index);
    setError("");

    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/files", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);

      updateStep(index, {
        mediaType: file.type.startsWith("video/") ? "video" : "image",
        mediaUrl: `/api/files/${payload.key}`,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "教程素材上传失败，请重试。");
    } finally {
      setUploadingIndex(null);
    }
  }

  return (
    <section className="tutorial-editor">
      <div className="tutorial-editor-head">
        <div>
          <p className="eyebrow">操作教程（可选）</p>
          <h2>{intro}</h2>
          <span>
            没有教程的资源不用填写。需要教程时，可以直接上传截图/视频，也可以手动粘贴外部链接。
          </span>
        </div>
        <button className="secondary-button" type="button" onClick={addStep}>
          添加步骤
        </button>
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      {steps.length === 0 ? (
        <div className="tutorial-empty">当前没有操作教程。需要时点击“添加步骤”。</div>
      ) : null}

      {steps.map((step, index) => (
        <fieldset className="tutorial-step-editor" key={index}>
          <legend>步骤 {index + 1}</legend>
          <div className="tutorial-step-actions">
            <span>{step.mediaUrl ? "已添加教程素材，可替换或清空" : "可上传截图或视频"}</span>
            <div className="tutorial-step-buttons">
              {step.mediaUrl ? (
                <button className="secondary-button compact-button" type="button" onClick={() => clearMedia(index)}>
                  清空素材
                </button>
              ) : null}
              <button className="danger-button" type="button" onClick={() => removeStep(index)}>
                删除步骤
              </button>
            </div>
          </div>
          <div className="form-grid">
            <label>
              步骤标题
              <input
                name="tutorialTitle"
                value={step.title}
                onChange={(event) => updateStep(index, { title: event.target.value })}
                placeholder="例如：下载并安装"
              />
            </label>
            <label>
              媒体类型
              <select
                name="tutorialMediaType"
                value={step.mediaType}
                onChange={(event) =>
                  updateStep(index, {
                    mediaType: event.target.value as TutorialStepInput["mediaType"],
                  })
                }
              >
                <option value="image">截图</option>
                <option value="video">视频</option>
                <option value="link">链接</option>
              </select>
            </label>
          </div>
          <label>
            步骤说明
            <textarea
              name="tutorialDescription"
              rows={3}
              value={step.description}
              onChange={(event) => updateStep(index, { description: event.target.value })}
              placeholder="写清楚这一步怎么操作。"
            />
          </label>
          <div className="tutorial-file-row">
            <label>
              截图 / 视频文件
              <input
                type="file"
                accept="image/*,video/*"
                disabled={uploadingIndex === index}
                onChange={(event) => uploadMedia(index, event.target.files?.[0])}
              />
            </label>
            <label>
              素材链接
              <input
                name="tutorialMediaUrl"
                type="url"
                value={step.mediaUrl}
                onChange={(event) => updateStep(index, { mediaUrl: event.target.value })}
                placeholder="上传后自动生成，也可以手动粘贴 https://..."
              />
            </label>
          </div>
          {step.mediaUrl ? (
            <p className="tutorial-hint">重新选择文件会替换当前素材链接；清空素材不会删除步骤文字。</p>
          ) : null}
          {uploadingIndex === index ? (
            <p className="tutorial-uploading">正在上传教程素材...</p>
          ) : null}
        </fieldset>
      ))}
    </section>
  );
}
