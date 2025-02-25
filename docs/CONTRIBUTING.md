# 开发指南

## 目录
1. [开发环境配置](#开发环境配置)
2. [项目设置](#项目设置)
3. [开发工作流](#开发工作流)
4. [代码规范](#代码规范)
5. [提交规范](#提交规范)
6. [发布流程](#发布流程)

## 开发环境配置

### 1. Rust 环境

1) 安装 Rust
```bash
# Windows
winget install Rustlang.Rustup

# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2) 验证安装
```bash
rustc --version  # 应显示 rust 版本信息
cargo --version  # 应显示 cargo 版本信息
```

### 2. 系统依赖

Windows:
- Visual Studio 2022 生成工具
  - 安装选项：✓ 使用 C++ 的桌面开发

macOS:
- Xcode 或命令行工具
```bash
xcode-select --install  # 如果已安装 Xcode 则跳过
```

Linux (Ubuntu/Debian):
```bash
sudo apt update && sudo apt install -y \
    libwebkit2gtk-4.0-dev \
    build-essential \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

### 3. Node.js 环境

1) 安装 Node.js LTS 版本
2) 安装 pnpm
```bash
npm install -g pnpm
```

## 项目设置

1. 克隆项目
```bash
git clone https://github.com/your-username/SummerToolbox.git
cd SummerToolbox
```

2. 安装依赖
```bash
pnpm install
```

3. 启动开发服务器
```bash
pnpm tauri dev
```

## 开发工作流

### 分支管理

- `main`: 主分支，用于发布
- `develop`: 开发分支
- `feature/*`: 功能分支
- `fix/*`: 修复分支

### 开发流程

1. 从 `develop` 创建功能分支
```bash
git checkout develop
git checkout -b feature/your-feature
```

2. 开发和测试
```bash
pnpm tauri dev  # 开发模式
pnpm test       # 运行测试
```

3. 提交代码
```bash
git add .
git commit -m "feat: add new feature"
```

## 代码规范

### TypeScript/React
- 使用 TypeScript 严格模式
- 组件使用函数式组件
- 使用 React Hooks
- 遵循 ESLint 规则

### Rust
- 使用 2018 edition
- 遵循 rustfmt 格式化
- 使用 clippy 进行代码检查

## 提交规范

使用 Conventional Commits 规范：

- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具相关

示例：
```bash
git commit -m "feat(encoder): add base64 encoding support"
git commit -m "fix(ui): correct button alignment"
```

## 发布流程

1. 版本号更新
```bash
pnpm version patch  # 或 minor/major
```

2. 构建应用
```bash
pnpm tauri build
```

3. 测试构建产物
```bash
# Windows
./src-tauri/target/release/summer-toolbox.exe

# macOS/Linux
./src-tauri/target/release/summer-toolbox
```

4. 创建发布标签
```bash
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

## 目录结构
```
SummerToolbox/
├── src/                 # React 前端源码
│   ├── assets/         # 静态资源
│   │   ├── images/    # 图片资源
│   │   └── styles/    # 样式文件
│   ├── components/     # 共用组件
│   ├── features/       # 功能模块
│   ├── hooks/         # 自定义 Hooks
│   ├── types/         # 类型定义
│   └── utils/         # 工具函数
├── src-tauri/          # Tauri 后端源码
│   ├── src/           # Rust 源码
│   └── Cargo.toml     # Rust 依赖配置
├── docs/               # 项目文档
├── tests/              # 测试文件
└── README.md          # 项目说明
```
