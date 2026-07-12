# 2026-07-12 Backup Import Restore

- [done] Add administrator-only JSON backup import endpoint with slug-based upsert.
- [done] Add admin console import control for previously exported LEEMING backup files.
- [done] Repair remaining mojibake in resource create/export API responses.
- [done] Add regression coverage for backup import permissions and readable copy.
- [done] Validate build/tests and deploy.

Impact: `app/api/resources/import/route.ts`, `app/api/resources/route.ts`, `app/api/resources/export/route.ts`, `components/admin-manager.tsx`, `tests/architecture.test.mjs`.

# 2026-07-12 Storage Cleanup On Delete

- [done] Delete the primary R2 object when an admin deletes a resource with `objectKey`.
- [done] Repair remaining mojibake in file API error messages and resource delete responses.
- [done] Add regression coverage for storage cleanup and readable file API copy.
- [done] Validate build/tests and deploy.

Impact: `app/api/resources/[id]/route.ts`, `app/api/files/route.ts`, `app/api/files/[...key]/route.ts`, `tests/architecture.test.mjs`.

# 2026-07-12 Admin Batch Management

- [done] Repair remaining mojibake copy in the admin manager.
- [done] Add checkbox selection and batch delete using the existing resource delete API.
- [done] Add regression coverage for readable admin batch management copy.
- [done] Validate build/tests and deploy.

Impact: `components/admin-manager.tsx`, `app/globals.css`, `tests/architecture.test.mjs`.

# 2026-07-12 Archive And Detail Copy Repair

- [done] Repair remaining mojibake copy in Archive page, resource cards, item detail page, and footer.
- [done] Add regression coverage for readable archive/detail copy.
- [done] Validate build/tests and deploy.

Impact: `app/archive/page.tsx`, `components/resource-card.tsx`, `app/item/[slug]/page.tsx`, `app/layout.tsx`, `tests/architecture.test.mjs`.

# 2026-07-12 Public And Form Copy Repair

- [done] Repair remaining mojibake copy on the home page and public navigation.
- [done] Repair upload and edit form Chinese copy and error messages.
- [done] Add regression coverage for readable home/form copy.
- [done] Validate build/tests and deploy after GitHub/Sites sync.

Impact: `app/page.tsx`, `components/site-nav.tsx`, `components/upload-form.tsx`, `components/edit-resource-form.tsx`, `tests/architecture.test.mjs`.

# 2026-07-12 Tutorial Media Maintenance

- [done] Repair readable Chinese copy in the tutorial editor.
- [done] Add clear/replace affordance for tutorial screenshot and video media URLs.
- [done] Add regression coverage for tutorial media maintenance copy.
- [in-progress] Validate build/tests and keep deployment state safe.

Impact: `components/tutorial-editor.tsx`, `app/globals.css`, `tests/architecture.test.mjs`.

# 2026-07-12 Resource Backup Export

- [done] Add administrator-only JSON export endpoint for resource metadata backup.
- [done] Add export entry in admin console with clear Chinese guidance.
- [done] Repair resource API Chinese error messages touched by backup flow.
- [done] Add regression tests for export permissions and admin backup entry.
- [done] Validate build/tests and deploy.

Impact: `app/api/resources/export/route.ts`, `app/api/resources/route.ts`, `app/api/resources/[id]/route.ts`, `components/admin-manager.tsx`, `tests/architecture.test.mjs`.

# 2026-07-12 Admin Dashboard Polish

- [done] Repair remaining mojibake copy in admin resource manager.
- [done] Add practical admin overview metrics for total resources, categories, tutorials, and latest update.
- [done] Improve admin search and empty states with clear Chinese guidance.
- [done] Validate build/tests and deploy.

Impact: `components/admin-manager.tsx`, `app/globals.css`, `tests/architecture.test.mjs`.

# 2026-07-12 Maintenance Cleanup

- [done] Remove unused ChatGPT auth helper after password admin login replacement.
- [done] Add a clean Chinese maintenance summary before the archived legacy mojibake section.
- [done] Add small mobile layout refinements for tables, forms, and item headers.
- [done] Validate build/tests and deploy.

Impact: `app/chatgpt-auth.ts`, `docs/refactor-plan-v3.md`, `app/globals.css`, `tests/architecture.test.mjs`.

# LEEMING 当前维护摘要

## 当前阶段

Sprint 4：体验优化、后台维护能力、移动端适配和长期稳定性。

## 已完成

- Next.js + TypeScript + Tailwind CSS 基础架构。
- Home / 资源库 / 详情页 / 管理后台 / 上传 / 编辑页面。
- D1 资源数据库和 R2 文件存储。
- 管理员密码登录，普通用户无需登录。
- 上传、编辑、删除、搜索、分类筛选。
- 可选操作教程，支持步骤、截图、视频和链接。
- 自定义域名 `leeming.net.cn` 上线。
- GitHub 仓库和 Sites 部署流程。
- 架构回归测试。

## 近期优先级

- 移动端细调。
- 教程素材替换/删除管理。
- 资源导出和备份。
- 后台批量管理。
- 搜索能力增强。

## 架构原则

1. 前台公开可读，后台管理员可写。
2. 首页和资源详情尽量使用服务端渲染，减少前台 JavaScript。
3. 文件和教程素材统一进入 R2，元数据进入 D1。
4. 每次迭代保持可构建、可部署、可回滚。
5. 不为了炫技增加复杂度，优先稳定性和长期维护成本。

# 2026-07-12 Admin Management Polish

- [done] Fix remaining admin manager mojibake text.
- [done] Add local admin search for resource management.
- [done] Improve admin table empty states and actions.
- [done] Validate build/tests and deploy.

Impact: `components/admin-manager.tsx`, `app/globals.css`.

# 2026-07-12 Tutorial Upload UX

- [done] Change tutorial editor from four always-visible steps to add/remove steps.
- [done] Allow each tutorial step to upload screenshot/video files through the existing R2 file API.
- [done] Auto-fill tutorial media URL after upload and keep manual URL editing available.
- [done] Improve tutorial editor layout so long forms stay readable.
- [done] Validate build/tests and deploy.

Impact: `components/upload-form.tsx`, `components/edit-resource-form.tsx`, `app/globals.css`.

# 2026-07-13 Tutorial Media Cleanup

- [done] Delete internal tutorial screenshots/videos from R2 when an admin deletes a resource.
- [done] Keep external tutorial links untouched so user-added reference URLs are safe.
- [done] Return cleanup metadata for easier future admin troubleshooting.
- [done] Add regression coverage for tutorial media cleanup.
- [done] Validate tests, commit, push, and publish the updated site.

Impact: `app/api/resources/[id]/route.ts`, `tests/architecture.test.mjs`.

# 2026-07-12 Resource Tutorial Module

- [done] Add optional tutorial steps for resources: title, description, media type, media URL.
- [done] Store tutorial data as JSON for future migration to uploaded media assets.
- [done] Update upload and edit forms with a clean tutorial section.
- [done] Render tutorial steps on item pages only when a resource has them.
- [done] Validate build/tests and deploy.

Impact: `db/schema.ts`, `db/index.ts`, `drizzle/0003_add_tutorial.sql`, `app/api/resources/**`, `components/upload-form.tsx`, `components/edit-resource-form.tsx`, `app/item/[slug]/page.tsx`, `app/globals.css`.

# 2026-07-12 Mainland Admin Login

- [done] Replace ChatGPT-based admin login with LEEMING-owned password login.
- [done] Store admin password and session secret only in runtime environment variables.
- [done] Protect admin pages and write APIs with a signed HttpOnly session cookie.
- [done] Add admin login and logout routes without changing public browsing.
- [done] Validate build/tests and deploy the updated production version.

Impact: `app/admin-auth.ts`, `app/admin/login/page.tsx`, `app/api/admin/**`, `components/admin-manager.tsx`, `tests/architecture.test.mjs`.

# 2026-07-12 Visual Audit Follow-up

- [done] Replace remaining card-level English status text such as `External`.
- [done] Replace icon-only resource card action with a Chinese text action.
- [done] Rebuild, test, and publish after the audit fixes.

Impact: `app/page.tsx`, `app/archive/page.tsx`, `components/resource-card.tsx`.

# 2026-07-12 Interface Language Pass

- [done] Keep brand and atmosphere labels refined, including `LEEMING` and `Personal Digital Archive`.
- [done] Convert functional navigation, buttons, links, and form actions to Chinese.
- [done] Keep public browsing and admin permission behavior unchanged.
- [done] Validate build and tests, then publish.

Impact: `components/site-nav.tsx`, `app/page.tsx`, `app/archive/page.tsx`, `app/item/[slug]/page.tsx`, `app/not-found.tsx`, `app/loading.tsx`, `components/resource-card.tsx`.

# 2026-07-12 Public Interface Redesign

- [done] Redesign the public home page as a usable archive entry instead of a marketing-style hero.
- [done] Repair visible Chinese copy on public pages and cards.
- [done] Keep the existing data, admin, upload, and deployment architecture unchanged.
- [done] Validate build and architecture tests before publishing.

Impact: `app/page.tsx`, `app/archive/page.tsx`, `components/resource-card.tsx`, `app/globals.css`.

# LEEMING 开发计划

## 当前阶段

Sprint 4：体验、性能、移动端与长期维护。

### Sprint 4 待办

- [完成] 统一 Home 与 D1 数据源，移除运行时静态数据分叉。
- [完成] 补齐 Upload/Edit 独立权限校验与 Admin 编辑入口。
- [完成] 完善加载、空状态、错误反馈和移动端导航。
- [完成] 建立 Worker 架构契约测试并完成权限、数据源与存储回归。
- [待办] 清理部署产物，构建、推送并更新线上版本。
- [完成] 为 R2 上传增加阶段反馈与失败回滚，避免孤立文件。
- [完成] 将认证升级为唯一管理员邮箱授权，封锁其他已登录用户的写入权限。

### Sprint 3 待办

- [完成] 使用平台 SIWC 保护 Admin 页面与写入 API。
- [完成] 接入 R2 文件存储并保存对象键。
- [待办] 部署 D1/R2 资源、迁移与线上版本。
- [待办] 验证权限、上传、下载和异常处理。

### Sprint 2 待办

- [完成] 建立 D1 资源表、索引与迁移。
- [完成] 完成资源新增、读取、编辑、删除 API。
- [完成] 让 Archive、Item、Admin 使用同一持久化数据源。
- [完成] 完成上传元数据读取、SHA256 计算与表单校验。
- [完成] 完成资源编辑页面与 CRUD HTTP 集成验证。
- [待办] 验证构建、测试、部署并推送 GitHub。

### GitHub 接入

- [完成] 连接 `ming0628-4/LEEMING` 仓库并推送 `main` 分支。
- [完成] 排除本地部署打包产物，保持仓库内容干净。

## 本轮待办

- [完成] 初始化 Next.js、TypeScript、Tailwind CSS 与 Git 仓库。
- [完成] 建立共享数据模型、示例数据和可复用页面组件。
- [完成] 完成 Home、Archive、Item、Search、Admin、Upload 页面。
- [待办] 为 Sprint 2 的增删改查预留稳定边界，不提前引入数据库与鉴权复杂度。
- [进行中] 运行构建与测试，修复阻塞问题。
- [待办] 完成部署并记录 Sprint 1 结果。

## 影响范围

- `app/`：路由、布局、页面与样式。
- `components/`：导航、资源卡片等共享 UI。
- `lib/`：资源类型、查询与示例数据。
- `tests/`：首屏及关键路由的可用性验证。
- 项目元数据与跨平台开发脚本。

## 架构决策

1. 前台与后台使用同一个 Next.js App Router 应用，共享 `lib/resources.ts` 数据契约，符合“一个产品、两种模式”。
2. Sprint 1 使用只读示例仓库呈现完整信息架构；上传页明确标记为工作流骨架。Sprint 2 再接入写入能力，避免用临时浏览器存储制造未来迁移成本。
3. 页面默认采用服务端组件；只有搜索筛选和上传交互需要客户端状态，降低首屏 JavaScript 与维护成本。
4. 路由与数据访问解耦，Sprint 2/3 可将示例仓库替换为数据库与对象存储，而不重写页面结构。
# 2026-07-12 Admin Access Update

- [done] Public visitors can open Home, Archive, and Item pages without login.
- [done] `/admin` is the only administrator entry and redirects anonymous admins to sign in.
- [done] Signed-in users who are not `ADMIN_EMAIL` remain blocked from admin pages and write APIs.
- [done] Public navigation hides the admin entry to avoid sending ordinary visitors into login.

Impact: `app/admin-auth.ts`, `app/admin/**`, `components/site-nav.tsx`, `app/layout.tsx`.
