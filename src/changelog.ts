/**
 * changelog - changelog
 *
 * 职责：
 * - 承载changelog相关的模块实现。
 * - 组织内部依赖与导出接口。
 * - 为上层功能提供支撑。
 */

type ChangelogItem = string | { text: string; children?: string[] };

export const changelogEntries: { date: string; items: ChangelogItem[] }[] = [
  {
    date: '2026-10-30',
    items: [
      '【修复】提高 Leaflet 弹窗样式优先级，避免生产构建白底覆盖自定义深色样式',
      '【修复】为弹窗覆盖规则统一加 .leaflet-container 前缀提升优先级',
      '【修复】修复 leaflet.css 在产物中排在 index.css 之后时默认白底覆盖深色弹窗的问题',
    ],
  },
  {
    date: '2026-10-29',
    items: [
      '【新增】同步 ValPoint：复用已有点位标注与相近点位聚合显示',
      '【新增】新增 lineupPositions 聚类工具，按英雄/技能把相近站位与落点合并为簇（容差 8 地图单位）',
      '【新增】查看模式按簇渲染地图标记，重叠点位通过弹层列出并可选中，连线改为悬停/选中时按簇锚点绘制',
      '【新增】标注面板新增“选择已有站位/落点”入口，命中候选后自动带入该点位的图片与描述并提示下一步标注',
      '【优化】重绘 Leaflet 弹层与合并弹层样式，新增候选点呼吸光圈与关闭按钮交互',
      '【新增】补充新英雄遐思数据：头像、技能图标与技能名称映射',
      '【优化】更新盐海矿镇(Corrode)攻守方 SVG 地图素材',
    ],
  },
  {
    date: '2026-06-26',
    items: [
      '【新增】增加新地图天枢云阙(Summit)并支持其实时状态展示',
      '【新增】导入天枢云阙(Summit)攻守方 SVG 地图文件及高清封面',
      '【新增】个人点位库报错标记功能（描述错误/图片错误/图片未标记/已处理）',
      '【新增】在 ViewerModal 中增加报错标记下拉菜单',
      '【新增】在 LeafletMap 中支持根据报错状态渲染红色错误外框',
      '【优化】更新本地配置 (localMaps, constants) 支持天枢云阙的基础数据和名称映射',
      '【修复】禁用 mapPoolService 远程请求缓存，修复地图池角标状态无法实时刷新的问题',
      '【新增】同步 ValPoint 更新并添加天枢云阙地图与报错标记功能',
      '【新增】新增 useErrorMarks.ts 与 error-marks.js 提供本地 SQLite 接口',
      '【新增】在 server/db.js 中新增 error_marks 表存储标记数据',
      '【新增】安装 react-is 依赖，修复 vite 打包异常',
      '【新增】移除 .gitignore 中的 data 目录，恢复 Git 对本地数据库的追踪',
    ],
  },
  {
    date: '2026-03-23',
    items: [
      '【优化】更新莲华古城地图 SVG 素材',
      '【优化】更新攻方-莲华古城(Lotus).svg 素材文件',
      '【优化】更新守方-莲华古城(Lotus).svg 素材文件',
    ],
  },
  {
    date: '2026-03-19',
    items: [
      '【新增】同步 ValPoint 角色筛选与迷核英雄，并修复技能图标抖动问题',
      '【新增】特工“迷核”相关数据、头像与技能资源',
      '【新增】左侧面板特工角色分类筛选（先锋/哨位/决斗/控场）',
      '【优化】特工头像区域布局，使其支持独立滚动并优化了悬浮动画',
      '【修复】技能图标选中高亮时引起的底部布局抖动问题',
    ],
  },
  {
    date: '2026-02-12',
    items: [
      '【新增】迁移 pad 端适配到 ValPoint-Local 并修复地图状态映射',
      '【新增】新增 useDeviceMode 与 PadPortraitSidebar，主视图支持 iPad 横屏混合布局和竖屏侧栏',
      '【优化】调整 LeftPanel、RightPanel、ViewerModal、Lightbox、LeafletMap 与安全区样式，pad 端隐藏快捷按钮',
      '【修复】补齐地图池 API 的 rotated_out/new 状态映射，正确显示在池/回归/轮出/新图角标',
      '【运维】删除 Sync from upstream 工作流并更新 valpoint-git-description 技能为 ValPoint-Local 项目校验',
      '【运维】同步 package-lock.json 与本地运行产生的 data/valpoint.db-shm 变更',
      '【文档】新增 iPad 适配迁移计划文档 docs/plans/2026-02-12-ipad-adaptation-port-to-local.md',
    ],
  },
  {
    date: '2026-02-10',
    items: [
      '【运维】GitHub Actions 多平台 Docker 构建（amd64 + arm64）',
      '【运维】重写 docker-build.yml，升级 build-push-action 并启用 GHA 缓存',
      '【运维】新增 release.js 一键发布脚本，支持版本号自动递增',
      '【运维】扩展 .dockerignore 排除规则',
      '【运维】清理废弃的 publish_docker.ps1 和 publish_docker.sh',
    ],
  },
  {
    date: '2026-02-09',
    items: [
      '【运维】整合 AI 规则文件并新增 git描述 技能',
      '【运维】将 data 目录纳入版本控制',
      '【运维】清理废弃脚本（auto_tag.js、cleanup-releases.mjs）',
      '【优化】Docker 发布脚本自动关联 Docker Hub 版本号',
      '【新增】新增亚海悬城/猎枭地图点位数据',
      '【优化】清理测试点位图片',
    ],
  },
  {
    date: '2026-02-05',
    items: [
      '【新增】迁移地图池状态功能，对接远程 API 实现状态实时同步',
      '【优化】MapPickerModal 支持显示"在池/回归/轮出"状态角标',
      '【新增】新增 public/log.html 独立日志页面，替代 Wiki 并适配深色主题',
      '【优化】ChangelogModal 仅展示最近详情，提供完整日志入口',
      '【重构】清理 src/changelog.ts 历史数据，同步 docker_local 分支记录',
    ],
  },
  {
    date: '2026-02-04',
    items: [
      '【新增】迁移地图池状态功能，对接远程 API 显示"在池/回归/轮出"状态',
    ],
  },
  {
    date: '2026-02-02',
    items: [
      '【新增】完善 Docker 发布自动化流程与部署文档',
      '【优化】服务端支持静态文件服务，修复容器内图片显示问题',
      '【优化】简化 docker-compose 配置，统一端口映射',
      '【文档】重写 README，新增 Docker Hub 发布指南',
    ],
  },
  {
    date: '2026-02-01',
    items: [
      '【重构】深度清理废弃逻辑与依赖，优化本地版架构',
      '【重构】移除 Supabase 依赖，扁平化项目结构',
      '【优化】优化编辑器 UI，实现图片物理删除',
      '【修复】修复点位批量删除及导入导出元数据丢失问题',
      '【新增】用户昵称持久化存储及导出元数据同步',
      '【优化】优化图片存储层级结构与命名规范',
    ],
  },
];
