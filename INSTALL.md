# Kuikly Expert — install into DeepSeek Harness

English | [中文](INSTALL.zh.md)

Install the four Kuikly skills into a `dsh` profile.

## Step 1 — Install the bundle

**From GitHub (source):**

```
dsh plugin --profile <your-profile> add github:Tencent-TDS/dsh-kuikly-expert
```

This fetches sources. The entry is plain ESM with no build step, so no `prepare` allowlist is needed.

**From a tarball (offline):**

```
cd dsh-kuikly-expert && npm pack
dsh plugin --profile <your-profile> add ./dsh-kuikly-expert-0.1.0.tgz
```

## Step 2 — Verify the layer

```
dsh --profile <your-profile> --dump-config
```

A `# == dsh-kuikly-expert` layer should appear, contributing one `dsh-kuikly-expert` row.

## Step 3 — Boot and use

```
dsh --profile <your-profile>
```

The four Kuikly skills now appear in the skill catalog. Ask the agent to scaffold, build, or preview a Kuikly app, and it will load the relevant skill on demand.

## Prerequisites

The skills drive the upstream `@kuikly-ai/create-kuikly-app` CLI, which needs:

- **JDK 17** (18+ causes build failures)
- **Android SDK** (API 30+, `ANDROID_HOME` set)
- **Node.js** ≥ 16
- **Xcode 15+** (macOS only, for iOS)
- **DevEco Studio** (HarmonyOS only)

The skill runs the CLI's own `doctor` to check these on first use.
