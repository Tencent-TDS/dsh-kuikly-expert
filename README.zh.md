# Kuikly Expert — DeepSeek Harness 的四个 Kuikly skill

[English](README.md) | 中文

[Kuikly](https://github.com/Tencent-TDS/KuiklyUI) 是腾讯的 Kotlin Multiplatform UI 框架,覆盖 Android、iOS、鸿蒙、H5 和小程序。本包将四个 Kuikly skill 打包为 **DeepSeek Harness (dsh) 插件** —— 安装一次,你的 dsh agent 就获得跨平台 Kuikly 开发知识:工程脚手架、UI 框架 API 参考、构建、真机预览。

脚手架、构建和预览仍由上游 [`@kuikly-ai/create-kuikly-app`](https://github.com/zealotchen0/create-kuikly-app) CLI 承担。skill 正文指示模型通过普通 shell 工具调用它,因此本插件贡献的是知识而非竞争性工具入口,CLI 发版也无需改 harness。

> 基于 [KuiklyUI](https://github.com/Tencent-TDS/KuiklyUI) —— Kotlin Multiplatform UI 框架。

---

## Kuikly Expert 是什么?

四个打包 skill,为 DeepSeek Harness agent 提供 Kuikly 跨平台开发知识:

- **kuikly-integration** —— 脚手架 KMP 工程,或将 Kuikly 渲染器接入现有 Android/iOS/鸿蒙宿主工程
- **kuikly-app-builder** —— 工程创建、页面与组件脚手架、构建、真机预览
- **kuikly-ui-framework** —— 传统 Kuikly DSL(`attr{}` / `event{}`)的组件、模块、公共类 API 参考
- **kuikly-compose-ui-framework** —— Compose DSL(`@Composable`)的组件、Modifier、状态、导航参考

每个 skill 是一个单层目录包(`<name>/SKILL.md`),其 `references/` 子树不参与目录发现。registry 提供 `directory` 资源基,因此 skill 正文内的相对路径基于 skill 自身目录解析,模型仅在任务需要时才读取参考文档。

---

## kuikly dsh 插件:你的跨平台 App 开发专家

- **创建跨平台应用,支持多端预览** —— 你说"帮我创建一个应用",agent 加载 `kuikly-app-builder`,通过 `create-kuikly-app` 脚手架建工程,可以选择 Android、iOS 或鸿蒙机型构建并预览,一条命令跑通从创建到真机预览的全流程。
- **现有工程接入 Kuikly** —— 你有一个现成的 Android、iOS 或鸿蒙工程,agent 加载 `kuikly-integration`,逐步指导渲染器依赖配置、容器实现、适配器接入、TestPage 验证,不用自己翻文档拼流程。
- **用 Kuikly 帮助你写业务页面** —— 你要写一个登录页,agent 加载 `kuikly-compose-ui-framework`,帮助你更快更好地写出可运行的代码。

---

## 安装

**DeepSeek Harness(`dsh`)** —— 将 bundle 安装到你启动的 profile,然后重启 `dsh`:

```
dsh plugin --profile <your-profile> add github:Tencent-TDS/dsh-kuikly-expert
```

然后重启 `dsh`。不要同时运行 `npx skills add` —— bundle 已经发布了这些 skill。

完整安装步骤见 [INSTALL.zh.md](INSTALL.zh.md)。

**从 tarball 安装** —— 如果不想从 GitHub 安装:

```
cd dsh-kuikly-expert && npm pack
dsh plugin --profile <your-profile> add ./dsh-kuikly-expert-0.1.0.tgz
```

---

## 保持联系

扫描下方二维码,关注我们的最新动态或联系我们咨询。

<p align="left">
    <div style="display: inline-block; text-align: center; margin-right: 20px;">
        <div>TDS 微信公众号</div>
        <img alt="TDS" src="assets/img/tds_qrcode.jpeg" width="200" />
    </div>
    <div style="display: inline-block; text-align: center; margin-right: 20px;">
        <div>TDS Framework 微信公众号</div>
        <img alt="TDS Framework WeChat Official Account" src="assets/img/tds_framework_qrcode.jpeg" width="200" />
    </div>
    <div style="display: inline-block; text-align: center;">
        <div>在线咨询</div>
        <img alt="Online Consult" src="assets/img/consult_qrcode.png" width="200" />
    </div>
</p>

有疑问、反馈或建议?加入 Kuikly 开发者社群:

- **GitHub Issues**: [Tencent-TDS/KuiklyUI/issues](https://github.com/Tencent-TDS/KuiklyUI/issues)
- **KuiklyUI 仓库**: [Tencent-TDS/KuiklyUI](https://github.com/Tencent-TDS/KuiklyUI)

---

## 许可证

KuiklyUI-AI。详见 [LICENSE](LICENSE)。
