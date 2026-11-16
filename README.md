# MatterViz — 化学成分可视化

把材料成分数据渲染成可交互的图表卡片。默认是饼图，也可以一键切到 Voronoi「晶格」视图；支持中英文、浅色/深色主题和手机单列布局。

材料来自 `src/materials.ts`，目前包含 19 种单质、化合物和合金（铀、水、氧化铁、不锈钢、康托合金、耐火高熵合金等）。

## 功能

- **比例切换**：顶栏可切换质量比和原子比，默认质量比；饼图与晶格会同步更新，百分比由元素原子数和原子量实时计算。
- **饼图（默认）**：visx `Pie` / `Arc` 绘制；标签单独一层渲染，不会再被后面的扇区盖住；小于 10% 的切片只在 hover 时显示；标签带白色描边，深浅色下都清晰。
- **晶格视图**：用 `@visx/delaunay` 把元素种子点切成 Voronoi 晶胞，每个晶胞填充对应元素的颜色，形成多晶组织质感的「晶格切片」；hover 时高亮当前晶胞和邻居，并在左上角显示「元素 · 占比」读数。
- **主题切换**：顶栏太阳/月亮按钮切换浅色/深色，写入 `<html data-theme>` 和 `localStorage`；刷新后保持，首帧由 `index.html` 里的极小脚本提前恢复，避免闪白/闪黑。
- **响应式**：桌面自动多列；`<=768px` 单列、收紧留白，图表按屏宽缩放；触屏没有 hover 时用按下反馈代替上浮。
- **中英文切换**：i18next / react-i18next，材料名、描述和界面文案都有 `zh` / `en` 资源。
- **搜索**：顶栏搜索栏按中英文名称、化学式和元素符号过滤卡片，不区分大小写、包含匹配（如「水 / Water / H₂O / h2o / Fe」）；无结果时显示空状态，`Esc` 或 × 清空。
- **SMILES**：卡片在化学式下方显示 SMILES（等宽字体、可选中复制）；合金、网络固体和混合物没有单一有意义的 SMILES，桌面端显示 `—`，手机端不显示该行。
- **单文件构建**：`pnpm build` 会生成一个可直接打开的 `dist/index.html`，CSS 和 JS 全部内联，无外部依赖。

## 技术栈

- TypeScript 7 + Vite 8
- `react` / `react-dom` 通过 pnpm alias 指向 `@preact/compat`（写 React API，运行时是 Preact）
- `@visx/shape`（饼图）、`@visx/group`、`@visx/delaunay`（晶格）
- `i18next` + `react-i18next`
- `vitest` + `preact-render-to-string`（测试时静态渲染 SVG）
- `oxlint`、`oxfmt`（lint 与格式化）

## 开始使用

要求 Node `>=20`、pnpm `>=12`。

```bash
pnpm install
pnpm dev
```

打开终端里 Vite 输出的地址即可。

### 构建单文件

```bash
pnpm build
```

流程是 `tsc -b` → `vite build` → `scripts/inline-build.mjs`：

1. 把 `dist/assets` 里的 JS、CSS 内联回 `dist/index.html`
2. 删除其余构建产物

最终只需要 `dist/index.html` 一个文件即可展示。`pnpm preview` 可以本地预览构建结果。

### 常用脚本

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 类型检查、构建并内联为单文件 |
| `pnpm preview` | 预览构建结果 |
| `pnpm lint` | `tsc -b` + `oxfmt --check src/ scripts/` + `oxlint` |
| `pnpm lint:tsc` | 只做类型检查（含 `src`、`tests`、`vite.config.ts`） |
| `pnpm lint:fmt` | 只检查格式 |
| `pnpm lint:eslint` | 只跑 oxlint（实际由 oxc 驱动） |
| `pnpm exec vitest run` | 运行测试（package.json 里暂未加 test 脚本） |

格式化可用 `pnpm exec oxfmt src/`。

## 目录结构

```
.
├─ index.html                  入口 HTML：只有主题预置脚本和 #root，不含 CSS
├─ src/
│  ├─ main.tsx                 挂载 App，引入 i18n 与全部样式
│  ├─ App.tsx                  页面布局、工具栏、视图/主题/语言切换、卡片
│  ├─ Sector.tsx               饼图扇区与标签（两段式渲染 + 标签布局）
│  ├─ Lattice.tsx              Voronoi 晶格视图
│  ├─ components/
│  │  ├─ slider.tsx            通用滑块切换器（等分选项 + 单个滑块）
│  │  └─ slider.css            滑块自带样式与移动端 / 动效降级
│  ├─ materials.ts             材料数据、Element/Material 类型、PALETTE
│  ├─ composition.ts           原子量常数、质量比/原子比纯函数
│  ├─ search.ts                搜索匹配逻辑（名称 / 化学式 / 元素符号）
│  ├─ i18n.ts                  中英文资源与 i18next 初始化
│  ├─ styles.css               基础样式：CSS 变量、深浅色、卡片、响应式
│  ├─ lattice.css              晶格视图样式
│  ├─ search.css               搜索栏与空状态样式
│  └─ vite-env.d.ts            Vite 客户端类型（支持 import CSS）
├─ tests/
│  ├─ composition.test.ts      原子量覆盖与两种比例计算测试
│  ├─ sector.test.tsx          饼图扇区/标签的静态渲染测试
│  └─ search.test.ts           搜索匹配逻辑测试
├─ scripts/
│  └─ inline-build.mjs         构建后把 JS/CSS 内联成单文件
├─ TASK.md                     开发过程记录
├─ vite.config.ts              Vite + Vitest 配置
└─ tsconfig.json               TypeScript 配置（含 src、tests、vite.config.ts）
```

## 实现要点

### 饼图

- `Pie` 负责计算弧段，`Sector` 只画弧并附带 `<title>`；`SectorLabel` 负责文字。
- `App.tsx` 先渲染全部扇区，再在单独的 `.sector-labels` 层渲染全部标签，保证标签永远画在弧上面。
- 标签位置按极坐标计算：大扇区（>=50%）放在 `0.45R`，其余放在 `0.62R`；两行文字（元素符号 + `n=pct%`），放不下的小切片退到 `0.8R`，并且只在 hover 时出现。
- 字号限制在 11–18px，文字使用 `paint-order: stroke` 的白色描边，标签层 `pointer-events: none`，不影响扇区 hover。

### 晶格

- 每种元素按 `pct * 1.5` 生成种子点（最少 3 个），总点数约 150。
- 用材料英文名哈希出 Park–Miller 随机序列，保证同一材料每次渲染的晶格完全一致。
- `voronoi({ data, x, y, width, height })` 计算晶胞，`Polygon` 渲染路径；晶胞填 `element.color`，白色细描边 + 原位白点。
- 外框是 1px 描边 + 圆角 + L 形角标，SVG 内用 `clipPath`（`rx=15`）把晶胞裁进圆角。

### 主题

- 浅色变量在 `:root`，深色变量在 `:root[data-theme='dark']`；`color-scheme` 同步切换。
- `index.html` 在 `<head>` 里读取 `localStorage.theme`，没有则用 `prefers-color-scheme`，设置 `document.documentElement.dataset.theme`。
- `App.tsx` 的太阳/月亮按钮更新 `data-theme` 并写回 `localStorage`；隐私模式或 `file://` 下存储失败会自动忽略。

### 搜索

- `src/search.ts` 的 `materialMatches` 是纯函数：名称（当前语言 + 中英文）、`formula`、`elements[].sym` 统一转小写后做 `includes` 匹配，空查询视为全部命中；化学式里的下标数字（₂）会先转成普通数字，所以 `h2o` 和 `H₂O` 等价。
- `App.tsx` 渲染时用 `t(name, { lng })` 同时取中英文名称，所以界面语言不影响搜索结果；没有命中时渲染 `.empty-state` 空状态。

### 数据与 i18n

```ts
interface Element {
  sym: string
  n: number
  color?: string
}

interface Material {
  name: string
  formula: string
  smiles?: string
  elements: Element[]
}
```

`smiles` 是可选的：分子和离子化合物填标准 SMILES（水 `O`、乙醇 `CCO`、食盐 `[Na+].[Cl-]`），合金、网络固体和混合物省略，卡片在桌面端显示 `—`、手机端隐藏该行。

`n` 表示元素的原子数或相对原子数，材料数据不存冗余的百分比。`src/composition.ts` 使用近似标准原子量常数计算质量占比（`n × 原子量` 后归一化），原子占比则直接按 `n` 归一化；顶栏比例切换默认选择质量比。原子量常数与计算逻辑由 `tests/composition.test.ts` 覆盖。

`name` 本身是 i18n key；卡片描述不单独存字段，渲染时直接拼出 `` `desc.${name}` `` 再交给 `t()`，例如 `name: 'Steel'` 对应 `desc.Steel`。

`PALETTE` 在模块加载时按元素顺序自动赋给 `element.color`，所以晶格和饼图用的是同一套颜色。

新增材料：在 `MATERIALS` 里追加一项，按需补上 `smiles`，并在 `src/i18n.ts` 的 `zh` / `en` 资源里补上名称和 `desc.<name>` 对应的文案即可。

新增界面语言：在 `resources` 里加一套翻译，并把 `Lang` 类型扩展成新的语言代码。

## 测试

```bash
pnpm exec vitest run
```

- `tests/sector.test.tsx` 用 `preact-render-to-string` 直接静态渲染 `Sector` + `SectorLabel`，不需要无头浏览器。
- `tests/composition.test.ts` 检查所有材料元素均有原子量常数，并覆盖 UO₂ 质量比、原子比和百分比归一化。
- `tests/search.test.ts` 覆盖中英文名称、化学式、元素符号的匹配与大小写处理。
- 首次运行会写出 `output/sector.svg`，方便直接在浏览器里查看渲染结果（`output/` 已在 `.gitignore` 中）。
- 测试文件也在 `tsconfig.json` 的 `include` 里，`pnpm lint:tsc` 会一起类型检查。

## 说明

- `dist/index.html` 设计为直接双击打开；如果浏览器限制 `file://` 下的 `localStorage`，主题会退回系统偏好。
- 仓库里 `package.json` 的 `name` 仍是历史名 `music-glass`，不影响运行。
- `TASK.md` 记录了从原始 MatterViz 页面压缩、i18n、标签修复、UI 美化到晶格视图的演进过程。
