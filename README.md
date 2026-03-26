# bgremover - 图片背景移除工具

> 🖼️ 拖拽即用的在线图片背景移除工具，无需注册，秒级出图。

## 功能特性

- ✅ 拖拽或点击上传图片（JPG / PNG / WebP，最大 10MB）
- ✅ 调用 Remove.bg API 智能移除背景
- ✅ 原图 / 处理后对比预览
- ✅ 一键下载透明背景 PNG
- ✅ 全程内存处理，不存储、不留痕

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Next.js 14（App Router）+ Tailwind CSS |
| 后端 | Next.js API Routes |
| 图片处理 | Remove.bg API |
| 部署 | Cloudflare Pages（或其他 Node.js 托管） |

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/lvye666666/image-background-remover.git
cd image-background-remover
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.local.example .env.local
# 编辑 .env.local，填入你的 Remove.bg API Key
```

> API Key 申请：<https://www.remove.bg/api>  
> 免费额度：每月 50 张，超出后 $0.09/张。

### 4. 本地运行

```bash
npm run dev
```

打开 <http://localhost:3000> 即可使用。

### 5. 部署到 Cloudflare Pages

1. Push 代码到 GitHub
2. 在 Cloudflare Pages 新建项目，连接 GitHub 仓库
3. 构建命令：`npm run build`，输出目录：`.next`
4. 在 Pages Settings 添加环境变量 `REMOVE_BG_API_KEY`
5. 部署完成！免费域名即可访问 🌐

## 项目结构

```
image-background-remover/
├── app/
│   ├── api/remove-bg/route.ts   # Remove.bg API 调用
│   ├── globals.css               # 全局样式 + Tailwind
│   ├── layout.tsx                # 页面布局
│   └── page.tsx                  # 主页面（拖拽上传 + 预览）
├── .env.local.example            # 环境变量示例
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

## License

MIT
