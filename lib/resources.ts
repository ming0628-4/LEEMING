export type Resource = { slug: string; name: string; version: string; category: string; tags: string[]; fileType: string; size: string; updatedAt: string; description: string; why: string; sourceUrl: string };

export const resources: Resource[] = [
  { slug: "everything", name: "Everything", version: "1.4.1", category: "效率工具", tags: ["Windows", "文件搜索", "必装"], fileType: "EXE", size: "1.8 MB", updatedAt: "2026-07-08", description: "瞬间定位 Windows 中的文件和文件夹。", why: "系统原生搜索无法承担高频文件定位。它体积小、稳定，是每次配置新电脑最先安装的工具之一。", sourceUrl: "https://www.voidtools.com/" },
  { slug: "localsend", name: "LocalSend", version: "1.17.0", category: "传输工具", tags: ["跨平台", "局域网", "开源"], fileType: "EXE", size: "14.6 MB", updatedAt: "2026-06-24", description: "无需互联网，在附近设备之间安全传输文件。", why: "在手机和电脑之间传文件时，不依赖账号、云盘或数据线，局域网内即可完成。", sourceUrl: "https://localsend.org/" },
  { slug: "obsidian", name: "Obsidian", version: "1.8.10", category: "知识管理", tags: ["Markdown", "双链", "本地优先"], fileType: "EXE", size: "246 MB", updatedAt: "2026-05-19", description: "基于本地 Markdown 文件的知识库。", why: "文件归自己所有，可长期迁移；双向链接适合建立跨项目的知识关系。", sourceUrl: "https://obsidian.md/" },
  { slug: "handbrake", name: "HandBrake", version: "1.9.2", category: "媒体工具", tags: ["视频", "转码", "开源"], fileType: "EXE", size: "23.4 MB", updatedAt: "2026-04-12", description: "可靠的开源视频转码工具。", why: "预设清晰、格式支持稳定，偶尔处理大视频时不需要重新寻找不可信的在线工具。", sourceUrl: "https://handbrake.fr/" },
  { slug: "rufus", name: "Rufus", version: "4.7", category: "系统工具", tags: ["启动盘", "Windows", "便携"], fileType: "EXE", size: "1.5 MB", updatedAt: "2026-03-30", description: "创建可启动 USB 安装介质。", why: "重装系统时最可靠的小工具之一，便携且无需安装。", sourceUrl: "https://rufus.ie/" },
  { slug: "inkscape", name: "Inkscape", version: "1.4", category: "设计工具", tags: ["SVG", "矢量", "开源"], fileType: "EXE", size: "136 MB", updatedAt: "2026-02-18", description: "成熟的开源矢量图形编辑器。", why: "处理 SVG 和简单矢量资产足够可靠，不需要为低频需求订阅大型设计套件。", sourceUrl: "https://inkscape.org/" },
];
export const categories = [...new Set(resources.map((item) => item.category))];
export function getResource(slug: string) { return resources.find((item) => item.slug === slug); }
