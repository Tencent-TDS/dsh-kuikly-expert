# Kuikly Expert — four Kuikly skills for DeepSeek Harness

English | [中文](README.zh.md)

[Kuikly](https://github.com/Tencent-TDS/KuiklyUI) is Tencent's Kotlin Multiplatform UI framework targeting Android, iOS, HarmonyOS, H5, and mini-programs. This package ships four Kuikly skill bundles as a **DeepSeek Harness (dsh) plugin** — install it once, and your dsh agent gains cross-platform Kuikly development knowledge: project scaffolding, UI framework API reference, building, and on-device preview.

Scaffolding, building, and previewing stay with the upstream [`@kuikly-ai/create-kuikly-app`](https://github.com/zealotchen0/create-kuikly-app) CLI. The skill bodies instruct the model to invoke it through the ordinary shell tool, so this plugin contributes knowledge rather than a competing tool surface, and a CLI release ships without a harness change.

> Powered by [KuiklyUI](https://github.com/Tencent-TDS/KuiklyUI), the Kotlin Multiplatform UI framework.

---

## What is Kuikly Expert?

Four bundled skills that give a DeepSeek Harness agent Kuikly cross-platform development knowledge:

- **kuikly-integration** — scaffolding a KMP project, or adding the Kuikly renderer to an existing Android/iOS/HarmonyOS host
- **kuikly-app-builder** — project creation, page and component scaffolds, building, and on-device preview
- **kuikly-ui-framework** — component, module, and public-class API reference for the classic Kuikly DSL (`attr{}` / `event{}`)
- **kuikly-compose-ui-framework** — component, Modifier, state, and navigation reference for the Compose DSL (`@Composable`)

Each skill is a single-level directory bundle (`<name>/SKILL.md`) whose `references/` subtree stays out of catalog discovery. The registry supplies a `directory` resource base, so relative paths inside a skill body resolve against the skill's own directory and the model reads reference documents only when a task needs them.

---

## Kuikly dsh plugin: your cross-platform app development expert

- **Create a cross-platform app with multi-device preview** — say "create an app", the agent loads `kuikly-app-builder`, scaffolds a project via `create-kuikly-app`, and you can build and preview on Android, iOS, or HarmonyOS devices — from project creation to on-device preview in one flow.
- **Add Kuikly to an existing project** — you have an existing Android, iOS, or HarmonyOS project, the agent loads `kuikly-integration`, walks you through renderer dependency setup, container implementation, adapter configuration, and TestPage verification — no need to piece together docs yourself.
- **Write business pages with Kuikly** — you want to write a login page, the agent loads `kuikly-compose-ui-framework`, helping you write runnable code faster and better.

---

## Install

**DeepSeek Harness (`dsh`)** — install the bundle into the profile you boot, then restart `dsh`:

```
dsh plugin --profile <your-profile> add github:Tencent-TDS/dsh-kuikly-expert
```

Then restart `dsh`. Do NOT also run `npx skills add` — the bundle already publishes these skills.

See [INSTALL.md](INSTALL.md) for the full setup walkthrough.

**From a tarball** — if you prefer not to install from GitHub:

```
cd dsh-kuikly-expert && npm pack
dsh plugin --profile <your-profile> add ./dsh-kuikly-expert-0.1.0.tgz
```

---

## Stay Connected

Scan the QR codes below to follow our latest updates or contact us for inquiries.

<p align="left">
    <div style="display: inline-block; text-align: center; margin-right: 20px;">
        <div>TDS WeChat Official Account</div>
        <img alt="TDS" src="assets/img/tds_qrcode.jpeg" width="200" />
    </div>
    <div style="display: inline-block; text-align: center; margin-right: 20px;">
        <div>TDS Framework WeChat Official Account</div>
        <img alt="TDS Framework WeChat Official Account" src="assets/img/tds_framework_qrcode.jpeg" width="200" />
    </div>
    <div style="display: inline-block; text-align: center;">
        <div>Online Support</div>
        <img alt="Online Consult" src="assets/img/consult_qrcode.png" width="200" />
    </div>
</p>

Questions, feedback, or suggestions? Join the Kuikly developer community:

- **GitHub Issues**: [Tencent-TDS/KuiklyUI/issues](https://github.com/Tencent-TDS/KuiklyUI/issues)
- **KuiklyUI repo**: [Tencent-TDS/KuiklyUI](https://github.com/Tencent-TDS/KuiklyUI)

---

## License

KuiklyUI-AI. See [LICENSE](LICENSE) for details.
