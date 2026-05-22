# AGENTS.md - 美柚订阅后台活动管理系统

## 项目概览

美柚会员订阅后台活动管理系统，提供活动模板管理、营销策略库配置和活动创建发布能力。通过三套标准模板将活动配置从人天级降至分钟级。

## 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **数据库**: Supabase (PostgreSQL)

## 目录结构

```
├── src/
│   ├── app/
│   │   ├── page.tsx                    # 活动概览仪表盘
│   │   ├── templates/page.tsx          # 模板管理页
│   │   ├── promo-patches/page.tsx      # 营销策略库页
│   │   ├── activities/
│   │   │   ├── page.tsx                # 活动列表页
│   │   │   └── new/page.tsx            # 新建活动三步向导
│   │   └── api/
│   │       ├── seed/route.ts           # 数据初始化 API
│   │       ├── templates/route.ts      # 模板 CRUD API
│   │       ├── promo-patches/
│   │       │   ├── route.ts            # 策略列表 API
│   │       │   └── [id]/route.ts       # 策略详情/更新/删除 API
│   │       └── activities/
│   │           ├── route.ts            # 活动列表 API
│   │           └── [id]/route.ts       # 活动详情/更新/删除 API
│   ├── components/
│   │   ├── ui/                         # shadcn/ui 组件库
│   │   └── layout/
│   │       ├── app-sidebar.tsx         # 侧边栏导航
│   │       └── admin-layout.tsx        # 全局布局
│   ├── lib/
│   │   ├── types.ts                    # 全局类型定义
│   │   ├── mock-data.ts               # 模拟数据（含产品套餐、奖池）
│   │   └── utils.ts                    # 工具函数
│   └── storage/database/
│       ├── shared/schema.ts            # Drizzle 数据库表定义
│       └── supabase-client.ts          # Supabase 客户端
├── DESIGN.md                           # 设计规范
└── AGENTS.md                           # 本文件
```

## 核心功能模块

### 1. 模板管理 (Template Management)
- 三级模板：S级(大促抽奖)、A级(周期会员日)、B级(轻量定向)
- 组件开关矩阵 (Slot Controller)：控制模板内局部楼层显隐
- 必选组件锁定，可选组件支持开关

### 2. 营销策略库 (Promo Patch Pool)
- 价格立减补丁：直减金额/折扣
- 加赠时长补丁：赠送会员天数
- 开卡赠礼补丁：实物礼包/场景券/虚拟权益

### 3. 活动列表与配置 (Activity Matrix)
- 三步创建向导：选择模板与基础信息 → 受众规则与货架配置 → 挂载玩法组件
- 客群分层：支持复合筛选条件
- 货架配置：动态勾选套餐、排序主推/次推、绑定策略补丁
- 抽奖挂载与素材替换

## 数据库表

| 表名 | 用途 |
|------|------|
| templates | 活动模板（含组件JSONB） |
| promo_patches | 营销策略补丁（含配置JSONB） |
| activities | 活动配置（含时序、受众、货架、素材等JSONB） |

## 构建与测试命令

```bash
pnpm install          # 安装依赖
pnpm ts-check         # TypeScript 类型检查
pnpm lint:build       # ESLint 静态检查
pnpm build            # 构建生产版本
```

## 代码风格

- 严格 TypeScript，禁止隐式 any 和 as any
- 字段名 snake_case（数据库列），组件内变量 camelCase
- shadcn/ui 组件优先，自定义组件放在对应功能目录下
- 页面组件使用 'use client' 声明

## API 接口

| 路径 | 方法 | 功能 |
|------|------|------|
| /api/seed | POST | 初始化模拟数据 |
| /api/templates | GET/POST | 模板列表/创建 |
| /api/promo-patches | GET/POST | 策略列表/创建 |
| /api/promo-patches/[id] | PATCH/DELETE | 策略更新/删除 |
| /api/activities | GET/POST | 活动列表/创建 |
| /api/activities/[id] | GET/PATCH/DELETE | 活动详情/更新/删除 |
