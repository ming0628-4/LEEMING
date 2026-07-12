import Link from "next/link";
import { notFound } from "next/navigation";
import { findResource, type TutorialStep } from "@/lib/resource-repository";

export default async function Item({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const item = await findResource((await params).slug);
  if (!item) notFound();

  return (
    <main className="shell item-page">
      <Link className="back" href="/archive">
        ← 返回资源库
      </Link>
      <div className="item-grid">
        <section>
          <div className="item-heading">
            <span className="file-badge large">{item.fileType}</span>
            <div>
              <p className="category">{item.category}</p>
              <h1>{item.name}</h1>
              <p>版本 {item.version || "未标注"}</p>
            </div>
          </div>
          <p className="item-description">{item.description}</p>
          <div className="why">
            <p className="eyebrow">Keep Reason</p>
            <h2>为什么保留</h2>
            <p>{item.why}</p>
          </div>
        </section>
        <aside className="item-aside">
          <dl>
            <div>
              <dt>文件大小</dt>
              <dd>
                {item.fileSize
                  ? `${(item.fileSize / 1048576).toFixed(2)} MB`
                  : "外部链接"}
              </dd>
            </div>
            <div>
              <dt>SHA256</dt>
              <dd>{item.sha256 ? `${item.sha256.slice(0, 12)}...` : "未记录"}</dd>
            </div>
            <div>
              <dt>最后更新</dt>
              <dd>{item.updatedAt}</dd>
            </div>
          </dl>
          <a
            className="primary-button"
            href={item.sourceUrl}
            target="_blank"
            rel="noreferrer"
          >
            获取资源
          </a>
        </aside>
      </div>

      <div className="tags">
        {item.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      {item.tutorial.length ? <Tutorial steps={item.tutorial} /> : null}
    </main>
  );
}

function Tutorial({ steps }: { steps: TutorialStep[] }) {
  return (
    <section className="tutorial-section">
      <div className="section-head">
        <div>
          <p className="eyebrow">操作教程</p>
          <h2>怎么使用</h2>
        </div>
        <span>{steps.length} 个步骤</span>
      </div>
      <div className="tutorial-list">
        {steps.map((step, index) => (
          <article className="tutorial-step" key={`${step.title}-${index}`}>
            <div className="tutorial-index">{String(index + 1).padStart(2, "0")}</div>
            <div className="tutorial-content">
              <h3>{step.title || `步骤 ${index + 1}`}</h3>
              {step.description ? <p>{step.description}</p> : null}
              {step.mediaUrl ? <TutorialMedia step={step} /> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TutorialMedia({ step }: { step: TutorialStep }) {
  if (step.mediaType === "image") {
    return (
      <a className="tutorial-media image" href={step.mediaUrl} target="_blank" rel="noreferrer">
        <img src={step.mediaUrl} alt={step.title || "教程截图"} />
      </a>
    );
  }

  return (
    <a className="tutorial-media link" href={step.mediaUrl} target="_blank" rel="noreferrer">
      <span>{step.mediaType === "video" ? "打开视频教程" : "打开教程链接"}</span>
      <strong>↗</strong>
    </a>
  );
}
