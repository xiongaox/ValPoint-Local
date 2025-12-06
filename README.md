# VALPOINT
Valorant lineups planner built with Vite + React + TypeScript + Supabase.

## 项目需求 & 场景
- 创建、管理、分享 Valorant 点位（站位/落点/截图/说明）。
- 支持攻防视角、特工/技能筛选、地图底图切换。
- 点位分享：生成分享 ID，任何人可预览；可一键保存到自己的库。
- 无登录轻量多用户：前端自定义 8 位 ID 作为“账号”，跨设备同步。

## 功能概览
- 地图：官方 API 拉取，攻/防底图切换，自定义地图底图配置。
- 过滤：按特工、技能、攻/防、标题搜索。
- 点位创建：地图标注站位/落点，填写标题/说明/截图，编辑/删除/批量清空。
- 预览/分享：输入分享 ID 打开分享视图；“保存到我的点位”克隆到个人库。
- 自定义 ID：前端输入 8 位字母数字 ID，跨设备共享自己的数据空间。
- 分页：列表超过 8 条时显示分页。

## 环境要求
- Node.js 18+（建议 LTS）
- npm（或 pnpm/yarn，脚本以 npm 为例）

## 环境变量
复制 `.env.example` 为 `.env` / `.env.local`，按需调整：
```env
# 个人数据所在 Supabase（必填，建议用自己的项目）
VITE_SUPABASE_URL=...your supabase url...
VITE_SUPABASE_ANON_KEY=...your anon key...

# 公共分享中转库（可用作者提供的公共库，或换成自己的公共项目）
VITE_SUPABASE_SHARE_URL=https://dhkmniuzmifvuozbhfhg.supabase.co
VITE_SUPABASE_SHARE_ANON_KEY=sb_publishable_3UBYzGE1w5z3cSb5cMfM1Q_ilKneWlM
```
说明：
- anon/publishable key 可以公开，但不要提交 `.env`；可在 `.env.example` 留默认值，部署时在平台环境变量里填入。
- 若留空分享库变量，代码会回退到主库，但无法跨库分享。

## 数据库表设计
### 个人点位表 `valorant_lineups`
```sql
id uuid primary key default gen_random_uuid(),
user_id text,
title text,
map_name text,
agent_name text,
agent_icon text,
skill_icon text,
side text,
ability_index int,
agent_pos jsonb,
skill_pos jsonb,
stand_img text, stand_desc text,
aim_img text, aim_desc text,
aim2_img text, aim2_desc text,
land_img text, land_desc text,
cloned_from text,
created_at timestamptz default now(),
updated_at timestamptz
```
RLS 示例（允许匿名读写；若需严格隔离，可改为 `user_id = auth.uid()` 并启用 Auth）：
```sql
alter table public.valorant_lineups enable row level security;
create policy "anon select" on public.valorant_lineups for select using (auth.role() = 'anon');
create policy "anon insert" on public.valorant_lineups for insert with check (auth.role() = 'anon');
create policy "anon update" on public.valorant_lineups for update using (auth.role() = 'anon');
create policy "anon delete" on public.valorant_lineups for delete using (auth.role() = 'anon');
```

### 分享中转表 `valorant_shared`
用于跨数据库共享。字段同上，新增 `share_id text primary key`、`source_id uuid`（原点位 id）。
```sql
create extension if not exists "uuid-ossp";
create table if not exists public.valorant_shared (
  share_id text primary key,
  source_id uuid,
  id uuid default uuid_generate_v4(),
  user_id text,
  title text,
  map_name text,
  agent_name text,
  agent_icon text,
  skill_icon text,
  side text,
  ability_index int,
  agent_pos jsonb,
  skill_pos jsonb,
  stand_img text, stand_desc text,
  aim_img text, aim_desc text,
  aim2_img text, aim2_desc text,
  land_img text, land_desc text,
  cloned_from text,
  created_at timestamptz default now(),
  updated_at timestamptz
);
alter table public.valorant_shared enable row level security;
create policy "anon select shared" on public.valorant_shared for select using (auth.role() = 'anon');
create policy "anon insert shared" on public.valorant_shared for insert with check (auth.role() = 'anon');
create policy "anon update shared" on public.valorant_shared for update using (auth.role() = 'anon');
create policy "anon delete shared" on public.valorant_shared for delete using (auth.role() = 'anon');
```

## 快速开始
```bash
npm install
cp .env.example .env   # 或手动创建 .env/.env.local 并填入变量
npm run dev            # http://localhost:5173
```

## 构建与预览
```bash
npm run build   # 产物在 dist/
npm run preview
```

## 部署
- Vercel/静态托管：构建命令 `npm run build`，输出目录 `dist/`，在平台上配置环境变量。
- Cloudflare Pages + wrangler：已提供 `wrangler.toml`（assets 模式，目录 `dist/`），部署命令 `npx wrangler deploy`。
- 请在目标平台配置上述环境变量（不会自动读取 .env/.env.example）。

## 前端架构
- 框架：Vite + React + TypeScript。
- 状态：React hooks，本地存储自定义 8 位 userId；查询/写入按 userId 隔离。
- 数据层：`supabase`（个人库）和 `shareSupabase`（公共分享库）。
- 核心组件：
  - `App.tsx`：业务流、状态管理、Supabase CRUD、分享/预览。
  - `LeafletMap`：地图底图与点位标注/连线。
  - `LeftPanel` / `RightPanel`：筛选、创建、列表、分享/删除/分页。
  - 各类 Modal：地图选择、预览、编辑、删除确认、提示灯箱等。
- 样式：Tailwind 风格类名 +自定义样式，分页/按钮已适配当前 UI 主题。

## 分享流程（公共中转库）
1) 个人表点位 -> 点击分享：生成短 ID（取 UUID 后两段），写入 `valorant_shared`（公共库）。
2) 访问分享：按 share_id 先查公共库；若缺失回退查个人表（兼容旧链接）。
3) “保存到我的点位”：从分享数据克隆到当前用户个人表。

## 小贴士
- 自定义 ID：输入 8 位字母数字（不区分大小写），可快速跨设备查看自己的数据。
- 分页：列表超过 8 条时出现上一页/下一页。
- 不要提交 `.env`，只提交 `.env.example`。公共分享库 anon key 可公开，但 service_role 等私钥绝不可放前端。
