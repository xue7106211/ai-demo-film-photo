# AGENT.md

## 项目概述

这个项目是一个基于 **Next.js 16 + React 19 + TypeScript** 的页面复刻工程，目标是还原 Michelle Liu 网站里的 `/film` 页面。

当前实现重点是：

- 保留原页面的整体信息结构和交互逻辑
- 复刻全屏胶片画廊的体验
- 用 **SVG 占位素材** 替代真实图片和视频
- 让后续 agent 能快速接手、定位和修改

目前：

- `/` 会直接渲染主页面
- `/film` 也会渲染同一个页面

这样做是为了避免首页依赖重定向，保证用户直接打开 `localhost:3000` 就能看到内容。

## 技术栈

- 框架：`Next.js 16.2.4`
- 视图库：`React 19`
- 语言：`TypeScript`
- 样式：全局 CSS 变量 + CSS Module
- 浏览器排查：`Playwright` 作为开发依赖已安装

## 常用命令

- 开发环境：`npm run dev`
- 生产构建：`npm run build`
- 生产启动：`npm run start`

如果本地打开后是白页，优先先检查：

- `3000` 端口是否被旧的 `next dev` 进程占用
- 当前浏览器标签页是否还挂在旧的失效响应上

## 目录结构说明

### 1. App 入口层

- `app/layout.tsx`
  负责全局 metadata 和全局样式引入。

- `app/page.tsx`
  根路由 `/` 的入口，直接渲染主页面体验。

- `app/film/page.tsx`
  `/film` 路由入口，同样渲染主页面体验。

- `app/globals.css`
  全局设计变量和基础文档样式，包含：
  - 颜色变量
  - 字体变量
  - 间距、圆角、阴影变量
  - `Michelle` 字体声明

### 2. 数据层

- `data/film.ts`
  整个页面的数据中心，包含：
  - `FILM_PROJECT`
  - `LOADING_MESSAGES`
  - `FILM_PHOTOS`

`FILM_PHOTOS` 是静态数组，驱动以下内容：

- 图片数量
- 宽高比
- 月份/年份
- note 文案
- 时间轴
- 占位素材生成

### 3. 组件层

- `components/film/film-experience.tsx`
  页面主控制器，负责整体状态、布局计算和交互。

- `components/film/film-experience.module.css`
  页面专属样式，负责固定视口、渐变遮罩、时间轴、modal、拖拽态等视觉结构。

- `components/film/timeline.tsx`
  底部时间轴组件，负责：
  - 当前 note
  - 月份/年份标签
  - 时间轴刻度
  - hover / active 状态

- `components/film/project-info-modal.tsx`
  右上角信息按钮打开的项目说明弹层。

- `components/film/media-placeholder.tsx`
  负责生成所有图片/视频占位用的 SVG 数据。

- `components/film/icons.tsx`
  页面左上角 logo 占位图标和右上角 info 图标。

## 页面结构理解

页面核心不是传统文档流，而是：

1. 一个固定在视口里的全屏容器
2. 中间一条横向胶片 strip
3. 顶部和左右的渐变遮罩
4. 左上角返回按钮
5. 右上角信息按钮
6. 底部时间轴
7. 底部一个用于桌面滚动映射的高度占位块

也就是说，用户看到的是一个固定视口体验，而不是普通页面在自然滚动。

## 核心交互模型

### 桌面端

桌面端现在支持三种切换方式：

- 页面纵向滚动切换图片
- 触控板 / 滚轮滑动切换图片
- 鼠标按住拖拽切换图片

交互结束后会自动吸附到最近一张图片。

关键常量：

- `DESKTOP_STEP`
  每一张图片对应的纵向滚动距离

- `DESKTOP_DRAG_STEP`
  桌面鼠标拖拽的灵敏度

- `SNAP_DELAY_MS`
  滚轮/触控板停止后，延迟多久自动 snap

### 移动端

移动端主要使用左右拖拽：

- 左右拖动切图
- 松手后吸附到最近一张

### 点击抑制

为了避免“拖拽完成后误触点击当前图片”，主组件里有一个 click suppression 机制。
只要本次 pointer 操作被判断为真实拖动，就不会在释放后触发 click 导航。

## 布局算法说明

这个页面不是简单的等宽横向列表。

主图会根据当前 `progress` 动态放大，附近图片也会按距离做缩放过渡，远处图片保持基础尺寸。

主要逻辑在 `film-experience.tsx`：

- `clamp`
- `smoothstep`
- `frameBandHeight`
- `topChromeSpace`

布局的大致流程是：

1. 根据视口尺寸计算基础卡片宽度
2. 根据当前 progress 计算每张图的放大程度
3. 重新得到每张图的宽高和 left 位置
4. 把当前焦点图的中心对齐到屏幕中线

## 样式体系说明

这个项目**没有用 Tailwind**，而是刻意采用：

- 全局 token：`app/globals.css`
- 页面局部样式：`film-experience.module.css`

这样做的好处是：

- 后续 agent 更容易查找视觉来源
- 调整动画、遮罩、布局时更直接
- 不会陷入工具类堆叠难以维护的问题

## 占位素材策略

项目明确规定不能使用真实图片/视频，因此现在所有媒体内容都是动态生成的 SVG 占位图。

`media-placeholder.tsx` 会根据月份生成不同的色调：

- June
- September
- October
- November
- December

当前主要有两个生成函数：

- `createFilmPlaceholder(photo, index)`
  生成胶片卡片占位图

- `createFeaturePlaceholder()`
  生成信息弹层里的大图占位图

## Modal 说明

`project-info-modal.tsx` 逻辑比较简单：

- 点击 info 按钮打开
- 点击遮罩关闭
- 按 `Escape` 关闭
- 通过 portal 渲染到 `document.body`

弹层内容来自 `FILM_PROJECT`，不是动态请求。

## 已知约束

- 这是结构和交互复刻，不是原站真实媒体素材复刻
- 当前没有后端接口
- 当前没有运行时数据请求
- 页面主要依赖静态数据和前端计算

## 后续 agent 最常改的文件

如果后续要改交互，优先看：

- `components/film/film-experience.tsx`

如果后续要改视觉，优先看：

- `components/film/film-experience.module.css`
- `app/globals.css`

如果后续要改图片数量、文案、月份、比例，优先看：

- `data/film.ts`

如果后续要改占位素材风格，优先看：

- `components/film/media-placeholder.tsx`

## 建议的后续优化方向

如果用户要求更高拟真度，优先级建议如下：

1. 继续微调拖拽和 wheel 的惯性与缓动
2. 提升 SVG 占位素材的“胶片感”
3. 增加左右方向键切图
4. 完善 reduced-motion 支持
5. 加一套页面级视觉回归截图

## 给后续 agent 的一句话总结

这个项目本质上是一个 **由单一 progress 状态驱动的全屏胶片画廊**：

- 数据在 `data/film.ts`
- 交互主控在 `film-experience.tsx`
- 视觉结构在 `film-experience.module.css`
- 媒体只是占位 SVG，不是真实资源

理解了这四点，基本就能快速接手整个项目。
