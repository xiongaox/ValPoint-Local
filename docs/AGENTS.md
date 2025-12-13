# 项目概览（中文）

- 功能模块
  - 个人库：登录后新增、编辑、删除、清空自己的点位；支持分享到共享库。
  - 共享库：查看他人分享的点位，支持复制到个人库（已在前端做防重，同一共享点位同一用户只保存一份）。
  - 地图与点位：Leaflet 地图标注站位/瞄点/落点，按地图、特工、侧翼、技能筛选与查看。
  - 分享：生成短 share_id 写入共享表；共享数据 15 天清理提示。
  - 认证：游客模式（仅查看/分享），登录模式（可增删改）。

- 前端架构与数据流
  - 状态与逻辑：React hooks 管理（示例：`useValorantData` 拉取地图/特工，`useLineups` 获取个人库，`useSharedLineups` 获取共享库，`useShareActions` 处理分享/复制，`useLineupActions` 做 CRUD）。
  - 地图展示：`components/LeafletMap` 渲染点位与标注。
  - 列表与面板：`LeftPanel` 选择地图/筛选，`RightPanel` 管理列表与操作。
  - 模态框：预览、编辑器、查看器、删除确认、地图选择等组件。
  - 数据存储：Supabase 两套库（主库 `valorant_lineups`/`valorant_users`，共享库 `valorant_shared`），`src/supabaseClient.ts` 创建主库与共享库客户端。

- 关键数据/表
  - 个人库 `valorant_lineups`：字段含 `user_id`、地图/特工/技能信息、图片描述、`cloned_from`（来源共享点位 id）。
  - 共享库 `valorant_shared`：字段含 `share_id`、`source_id`、与点位内容字段。前端已在保存到个人库时防重检查 `(user_id, cloned_from)`。

# 代理人与技能数据

- 数据来源：`useValorantData` 调用 `https://valorant-api.com/v1/agents?language=zh-CN&isPlayableCharacter=true`，使用返回的 `displayName`、`displayIcon`、`abilities`。
- 技能槽位：统一按 C / Q / E / X（Ability1 / Ability2 / Grenade / Ultimate）顺序展示，`abilityIndex` 对应 0/1/2/3。
- 本地覆盖：`src/data/ability_overrides.json` 以代理人中文名或英文名为键，提供技能图标与中文标题覆盖；`src/utils/abilityIcons.ts` 优先使用覆盖，再回退接口的 `displayIcon`。
- 过滤规则：被动技能（slot 为 Passive）在 `getAbilityList` 中被过滤，不参与索引与展示。
- 默认选中：特工列表按名称排序后默认选中第一个特工。

# 相关代码位置

- 数据获取：`src/hooks/useValorantData.ts`（地图/特工），`src/hooks/useLineups.ts`（个人库），`src/hooks/useSharedLineups.ts`（共享库）。
- 分享/复制：`src/hooks/useShareActions.ts`（分享到共享表、复制到个人库防重）。
- 图标与文案：`src/utils/abilityIcons.ts` + `src/data/ability_overrides.json`。
- 常量：`src/constants/maps.ts`（地图翻译与自定义 URL），`src/services/tables.ts`（表名）。
- 外部抓取脚本：`scripts/fetchAbilities.cjs` 通过 `https://api.val.qq.com` 的 GraphQL 接口抓取特工技能图标/名称，生成 `src/data/ability_overrides.json`（仅本地运行脚本时生效，线上运行时仍使用仓库内的 JSON）。
