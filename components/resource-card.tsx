import Link from "next/link";
import type { Resource } from "@/lib/resources";

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <article className="resource-card">
      <div className="card-top">
        <span className="file-badge">{resource.fileType}</span>
        <span>{resource.updatedAt}</span>
      </div>
      <p className="category">{resource.category}</p>
      <h3>
        <Link href={`/item/${resource.slug}`}>{resource.name}</Link>
      </h3>
      <p>{resource.description}</p>
      <div className="tags">
        {resource.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="card-bottom">
        <span>
          版本 {resource.version || "未标注"} · {resource.size}
        </span>
        <Link href={`/item/${resource.slug}`} aria-label={`查看 ${resource.name}`}>
          查看
        </Link>
      </div>
    </article>
  );
}
