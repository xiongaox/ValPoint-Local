# iPad 适配迁移到 Local 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 `codex/ipad-landscape-adaptation` 分支中的 pad 端关键优化迁移到 `ValPoint-Local`，确保 iPad 横屏采用混合布局、iPad 竖屏维持移动端交互能力。

**Architecture:** 在 local 版本新增统一设备模式 Hook（`mobile` / `tablet-landscape` / `desktop`），将现有仅宽度判断升级为“设备 + 方向 + 宽度”判定。主视图按三态渲染：手机移动端、iPad 横屏混合布局（紧凑左栏 + 右抽屉）、桌面三栏。详情弹窗与灯箱按设备模式做可读性和手势/滚轮优化。

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind + Leaflet

---

### Task 1: 设备模式能力迁移

**Files:**
- Create: `src/hooks/useDeviceMode.ts`
- Modify: `src/hooks/useIsMobile.ts`
- Modify: `src/features/lineups/controllers/useAppState.ts`

**Step 1: 新增 `useDeviceMode`**

实现 `mode`、`isMobile`、`isTabletLandscape`、`isIPad`、`isPortrait` 输出；兼容 iPadOS 桌面 UA 与 DevTools 设备模拟。

**Step 2: 保持兼容接口**

`useIsMobile` 内部改为委托 `useDeviceMode`，外部签名不变。

**Step 3: 状态层切换**

`useAppState` 使用 `useDeviceMode().isMobile` 驱动默认攻防侧（移动端 `attack`，非移动端 `all`）。

**Step 4: 验证**

Run: `npm run build`
Expected: PASS（无类型错误）

### Task 2: 主视图与面板布局迁移

**Files:**
- Create: `src/components/PadPortraitSidebar.tsx`
- Modify: `src/features/lineups/MainView.tsx`
- Modify: `src/components/LeftPanel.tsx`
- Modify: `src/components/RightPanel.tsx`
- Modify: `src/components/QuickActions.tsx`

**Step 1: MainView 引入三态策略**

- `mobile`：保持现有移动布局。
- `tablet-landscape`：左栏紧凑、右栏抽屉、地图优先。
- `desktop`：保持现有桌面三栏。

**Step 2: iPad 竖屏侧栏**

新增 `PadPortraitSidebar`，在 iPad 竖屏提供地图/英雄快速入口，避免纯手机布局在平板上的可达性问题。

**Step 3: 面板组件适配**

- `LeftPanel` 增加 `layoutMode`（`desktop`/`tablet-compact`）。
- `RightPanel` 增加 `layoutMode`（`desktop`/`tablet-drawer`），抽屉模式隐藏创建/导入入口。
- `QuickActions` 增加 `mode`/`sizeMode`，pad 下收紧尺寸并保留 local 核心入口。

**Step 4: 验证**

Run: `npm run build`
Expected: PASS

### Task 3: 详情与灯箱可读性迁移

**Files:**
- Modify: `src/components/ViewerModal.tsx`
- Modify: `src/components/Lightbox.tsx`

**Step 1: ViewerModal 模式化**

按 `useDeviceMode` 区分 `isMobileLayout` 与 `isTabletDesktop`，收紧 iPad 下头部按钮尺寸、弹窗最大宽度和内容间距。

**Step 2: Lightbox 触控与滚轮增强**

迁移 iPad 触控切图动画、滚轮缩放/切图逻辑、安全区底栏样式与按钮尺寸策略。

**Step 3: 验证**

Run: `npm run build`
Expected: PASS

### Task 4: 地图与全局样式补齐

**Files:**
- Modify: `src/components/LeafletMap.tsx`
- Modify: `src/index.css`

**Step 1: 地图滚轮兜底**

在 Leaflet 容器添加非被动 wheel 监听，给 iPad/模拟触控环境提供稳定缩放兜底。

**Step 2: 安全区样式**

新增安全区 CSS 变量与平板抽屉/底栏类（`tablet-drawer-panel`、`tablet-bottom-safe`）。

**Step 3: 验证**

Run: `npm run build`
Expected: PASS

### Task 5: 回归验证

**Files:**
- Reference: `src/features/lineups/MainView.tsx`
- Reference: `src/hooks/useDeviceMode.ts`

**Step 1: 静态验证**

Run: `npm run build`
Expected: PASS

**Step 2: 手工验证矩阵（DevTools）**

- iPad Air 竖屏：应表现为移动端交互 + pad 侧栏能力。
- iPad Air 横屏：左栏紧凑 + 右抽屉 + 地图优先。
- 手机：保持当前移动布局。
- 桌面：保持当前三栏布局。

**Step 3: 关键交互检查**

- 点位查看、筛选、抽屉开合、灯箱切图与关闭。
- 横竖屏切换后地图不空白、筛选状态不异常。

