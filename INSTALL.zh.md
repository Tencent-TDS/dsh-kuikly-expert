# Kuikly Expert — 安装到 DeepSeek Harness

[English](INSTALL.md) | 中文

将四个 Kuikly skill 安装到 `dsh` profile。

## 第 1 步 —— 安装 bundle

**从 GitHub(源码方式):**

```
dsh plugin --profile <your-profile> add github:Tencent-TDS/dsh-kuikly-expert
```

拉取的是源码。入口为纯 ESM,无构建步骤,无需 `prepare` allowlist。

**从 tarball(离线):**

```
cd dsh-kuikly-expert && npm pack
dsh plugin --profile <your-profile> add ./dsh-kuikly-expert-0.1.0.tgz
```

## 第 2 步 —— 验证层

```
dsh --profile <your-profile> --dump-config
```

应出现 `# == dsh-kuikly-expert` 层,贡献一个 `dsh-kuikly-expert` 行。

## 第 3 步 —— 启动并使用

```
dsh --profile <your-profile>
```

四个 Kuikly skill 现在出现在 skill 目录中。让 agent 脚手架、构建或预览 Kuikly 应用,它会按需加载对应 skill。

## 前置条件

skill 驱动上游 `@kuikly-ai/create-kuikly-app` CLI,需要:

- **JDK 17**(18+ 会导致构建失败)
- **Android SDK**(API 30+,设置 `ANDROID_HOME`)
- **Node.js** ≥ 16
- **Xcode 15+**(仅 macOS,用于 iOS)
- **DevEco Studio**(仅鸿蒙)

skill 会在首次使用时运行 CLI 自带的 `doctor` 检查这些。
