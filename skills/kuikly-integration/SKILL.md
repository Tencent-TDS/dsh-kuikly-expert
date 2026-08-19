---
name: kuikly-integration
description: >
  KuiklyUI 工程接入助手。支持两种工作模式：(1) 空目录脚手架——根据用户选择的 DSL 类型（Kuikly DSL 或 Compose DSL）通过 `@kuikly-ai/create-kuikly-app` CLI 生成接入工程，快速创建可运行的 KMP 跨端工程；(2) 现有工程接入——指导开发者将 Kuikly 渲染器接入到现有 Android / iOS / 鸿蒙宿主工程，涵盖环境搭建、渲染器依赖添加、承载容器实现、适配器配置、TestPage 验证等完整流程。
homepage: https://github.com/zealotchen0/create-kuikly-app
tags:
  - kuikly
  - integration
  - cross-platform
  - android
  - ios
  - harmonyos
  - kmp
  - compose
license: MIT
metadata: {"clawdbot":{"emoji":"🔌","requires":{"bins":["node","java","pod","xcodegen","xcrun"],"env":["ANDROID_HOME","JAVA_HOME"]},"install":[{"id":"npm","kind":"npm","package":"@kuikly-ai/create-kuikly-app","bins":["kuikly","create-kuikly-app"],"label":"Install create-kuikly-app (npm)"}]}}
---

# Kuikly 工程接入

> **Kuikly** 是腾讯开源的基于 Kotlin Multiplatform 的超高性能动态化框架，一套代码可运行于 Android、iOS、鸿蒙、H5、小程序等多端。
>
> - **官方文档：** [https://kuikly.tds.qq.com/DevGuide/dev-guide-overview.html](https://kuikly.tds.qq.com/DevGuide/dev-guide-overview.html)
> - **GitHub：** [https://github.com/Tencent-TDS/KuiklyUI](https://github.com/Tencent-TDS/KuiklyUI) （欢迎 Star ⭐）
>
> 欢迎访问以上链接了解 Kuikly 的完整能力、开发指南和最新动态。

## 概述

本 skill 支持两种工作模式，根据用户提供的目录状态自动判断：

1. **空目录脚手架模式** — 用户提供了一个空目录（或不存在的新目录），根据用户选择的 DSL 类型调用 npm CLI 脚手架生成接入工程，快速创建可运行的 KMP 跨端工程
2. **现有工程接入模式** — 用户提供了一个已有工程目录，按照接入流程将 Kuikly 渲染器逐步接入到现有 Android / iOS / 鸿蒙宿主工程中

### 整体架构

```
┌─────────────────────────────────────────────┐
│              KMP 业务工程（shared）            │
│   Kotlin 跨端代码 → 编译为各平台产物           │
│   Android: .aar   iOS: .xcframework          │
│           鸿蒙: .so + ArkTS                   │
└──────────────┬──────────────────────────────┘
               │ 依赖
    ┌──────────┼──────────┐
    │          │          │
    ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐
│Android │ │  iOS   │ │ 鸿蒙   │
│渲染器  │ │渲染器  │ │渲染器  │
│适配器  │ │适配器  │ │适配器  │
└────────┘ └────────┘ └────────┘
```

---

## 工作模式判断流程

当用户请求接入 Kuikly 时，首先判断工作模式：

### 第一步：判断目录状态

检查用户指定的目标目录：

1. **目录不存在或为空**（无任何源码文件） → 进入 **空目录脚手架模式**（见下方「模式一」）
2. **目录已存在且包含工程文件**（有 `build.gradle`、`Podfile`、`.xcodeproj`、`package.json` 等） → 进入 **现有工程接入模式**（见下方「模式二」）

### 第二步：按模式执行

- 空目录 → 询问用户使用哪种 DSL（Kuikly DSL 或 Compose DSL），确认工程名与包名后执行 npm CLI 脚手架命令生成工程
- 现有工程 → 按各平台接入流程逐步指导

---

## 脚手架生成与 DSL 说明

空目录脚手架模式统一通过 npm CLI 生成工程：

```bash
npx --yes @kuikly-ai/create-kuikly-app@latest --json create-integration MyApp --package com.example.myapp
npx --yes @kuikly-ai/create-kuikly-app@latest --json create-integration MyApp --dsl compose --package com.example.myapp
```

其中：

- **`MyApp`**：工程名
- **`--package`**：指定包名 / namespace
- **`--dsl compose`**：仅在 Compose DSL 时传入；省略时默认生成 Kuikly DSL 工程

> **CLI 版本说明：** 每次运行前都应先检查当前可用的最新 CLI 版本，统一使用 `npx --yes @kuikly-ai/create-kuikly-app@latest --json ...` 执行。`--yes` 用于自动跳过 `npx` 的 `Ok to proceed?` 交互确认，避免在自动化场景中卡住；`@latest` 确保每次都拉取 npm 上的最新版本而非复用本地缓存。

### 生成类型一：`kuikly`（Kuikly DSL）

- **生成命令：** `npx --yes @kuikly-ai/create-kuikly-app@latest --json create-integration MyApp --package com.example.myapp`
- **DSL 类型：** Kuikly DSL（原生 DSL）
- **页面写法：** 继承 `Pager`，重写 `body(): ViewBuilder`，使用 `Text {}`、`Column {}` 等 Kuikly 原生组件
- **特点：** 极简模板，仅包含 `RouterPage` + `BasePager`，适合快速起步

```kotlin
// Kuikly DSL 生成结果中的页面写法示例
@Page("router", supportInLocal = true)
internal class RouterPage : BasePager() {
    override fun body(): ViewBuilder = {
        Text {
            attr { text("Hello Kuikly") }
        }
    }
}
```

### 生成类型二：`compose`（Compose DSL）

- **生成命令：** `npx --yes @kuikly-ai/create-kuikly-app@latest --json create-integration MyApp --dsl compose --package com.example.myapp`
- **DSL 类型：** Compose DSL（Jetpack Compose 风格）
- **页面写法：** 继承 `Pager`，重写 `willInit()`，调用 `setContent {}`，使用 `@Composable` 函数和 `Modifier` 链式调用
- **额外插件：** `org.jetbrains.compose` + `kotlin("plugin.compose")`
- **额外依赖：** `com.tencent.kuikly-open:compose:${kuiklyVersion}`
- **特点：** 功能更丰富，包含 `RouterPage` + `BasicWidget` + `BridgeModule` + `Utils` 等，适合熟悉 Compose 的开发者

```kotlin
// Compose DSL 生成结果中的页面写法示例
@Page("router", supportInLocal = true)
internal class ComposeRoutePager : BasePager() {
    override fun willInit() {
        super.willInit()
        setContent {
            ComposeRouteImpl()
        }
    }
}

@Composable
fun ComposeRouteImpl() {
    Column(modifier = Modifier.fillMaxSize()) {
        Text(text = "Hello Kuikly Compose")
    }
}
```

### 脚手架输出目录结构（共同）

```
{MyApp}/
├── androidApp/          # Android 壳工程（KuiklyRenderActivity + Adapter + Module）
├── iosApp/              # iOS 壳工程（KuiklyRenderViewController + Handler + Module）
├── ohosApp/             # 鸿蒙壳工程（Kuikly 组件 + Adapter + Module）
├── shared/              # KMP 共享模块（@Page 页面 + BasePager + BridgeModule）
├── static_server/       # 静态资源服务器（开发调试用）
├── buildSrc/            # Gradle 构建脚本（版本管理）
├── build.gradle.kts     # 根构建脚本
├── settings.gradle.kts  # 工程设置
├── gradle.properties    # Gradle 属性
└── gradlew / gradlew.bat
```

### 两种 DSL 核心差异对照表

| 维度 | `kuikly` 生成结果 | `compose` 生成结果 |
|------|-------------------|--------------------|
| **DSL 类型** | Kuikly DSL | Compose DSL |
| **包名** | 由 `--package` 指定 | 由 `--package` 指定 |
| **额外插件** | 无 | `org.jetbrains.compose`、`kotlin("plugin.compose")` |
| **额外依赖** | 无 | `com.tencent.kuikly-open:compose` |
| **页面入口** | `override fun body(): ViewBuilder` | `override fun willInit() { setContent {} }` |
| **UI 写法** | `Text { attr { text("...") } }` | `Text(text = "...", modifier = Modifier...)` |
| **源码丰富度** | 极简（2 个 kt 文件） | 丰富（5+ 个 kt 文件，含组件封装） |
| **Compose 场景注意** | — | 需设置 `KRThreadAdapter.stackSize() = 8MB` |

---

## 模式一：空目录脚手架

当目标目录为空或不存在时，执行以下步骤：

### 1. 确认 DSL 类型

询问用户使用哪种 DSL：

- **Kuikly DSL** → 使用默认命令（适合新项目、想用 Kuikly 原生 API）
- **Compose DSL** → 在命令中追加 `--dsl compose`（适合熟悉 Jetpack Compose 的开发者）

> 如果用户未明确指定，默认推荐 **Kuikly DSL**，因为更轻量、依赖更少。

### 2. 确认工程名与包名

在执行脚手架前确认两个参数：

- **工程名**：对应命令里的 `MyApp`
- **包名 / namespace**：对应命令里的 `--package com.example.myapp`

默认建议：

- 若用户未提供工程名，可使用目标目录名
- 若用户未提供包名，可建议使用 `com.example.<工程名小写>`

### 3. 执行 npm CLI 脚手架命令

在目标目录的父目录下执行对应命令，生成工程：

```bash
# Kuikly DSL
npx --yes @kuikly-ai/create-kuikly-app@latest --json create-integration MyApp --package com.example.myapp

# Compose DSL
npx --yes @kuikly-ai/create-kuikly-app@latest --json create-integration MyApp --dsl compose --package com.example.myapp
```

执行要点：

- **Kuikly DSL**：不传 `--dsl`，默认生成 Kuikly DSL 工程
- **Compose DSL**：追加 `--dsl compose`
- **目标目录**：如果用户指定的是一个新目录，令工程名与目标目录名保持一致
- **已存在空目录**：优先在其父目录执行命令，再生成同名工程目录

### 4. 生成 local.properties

根据当前环境生成 `local.properties`：

```properties
sdk.dir=/path/to/Android/Sdk
```

### 5. 验证工程

- **Android：** `./gradlew :androidApp:assembleDebug`，选择 `androidApp` 运行到设备/模拟器
- **iOS：** 进入 `iosApp` 目录执行 `pod install --repo-update`，用 Xcode 打开 `.xcworkspace` 运行
- **鸿蒙：** 使用 DevEco Studio 打开 `ohosApp` 运行

### 6. 后续指导

生成完成后，告知用户：

- 工程已生成，包含一个 `router` 页面作为示例
- 如需新增页面，在 `shared/src/commonMain/kotlin/` 下创建新的 `@Page` 类
- 如需接入到已有宿主工程，参考下方「模式二」
- 如需环境搭建指导，参考下方「第一阶段：环境搭建」

---

## 模式二：现有工程接入

当目标目录已包含工程文件时，按照以下流程逐步接入 Kuikly 渲染器。

### 接入流程

现有工程接入 Kuikly 的标准流程：

1. **环境搭建**（第一阶段） — 确保开发环境就绪
2. **添加 KMP shared 模块**（第二阶段） — 在现有工程中创建或添加 KMP shared 模块，用于存放跨端业务代码
3. **平台接入**（第三/四阶段） — 在现有工程的各平台模块中接入渲染器、实现适配器
4. **验证**（第五阶段） — 编写 TestPage 验证接入成功

> ⚠️ **不要询问用户"是否需要创建 KMP 工程"或"是否覆盖现有项目"**。现有工程接入时，KMP shared 模块是必须的，应该直接在现有工程中添加，而不是覆盖或替换现有工程。

### 按平台区分的接入路径

根据用户提供的工程类型，选择对应的接入路径：

| 工程类型 | 接入路径 |
|----------|----------|
| **Android 工程** | 添加 KMP shared 模块 → Android 平台接入（第三阶段）→ 验证 |
| **iOS 工程** | 添加 KMP shared 模块（需 Mac 环境）→ iOS 平台接入（第四阶段）→ 验证 |
| **鸿蒙工程** | 添加 KMP shared 模块 → 鸿蒙平台接入（第四阶段鸿蒙）→ 验证 |
| **多端工程** | 添加 KMP shared 模块 → 各平台分别接入 → 验证 |

按照下方各章节顺序指导用户完成接入。**所有代码示例均来自官方文档，禁止凭记忆编造 API。**

---

## 第一阶段：环境搭建

### 必须安装的工具

| 工具 | 用途 | 备注 |
|------|------|------|
| Android Studio | 主 IDE，创建 KMP 工程 | 版本 ≥ 2024.2.1 时需将 Gradle JDK 切换为 JDK 17 |
| Kotlin 插件 | KMP 支持 | Android Studio → Settings → Plugins → Marketplace |
| Kotlin Multiplatform 插件 | KMP 支持 | 同上 |
| Kuikly AS 插件 | 脚手架，一键生成工程 | 详见官方插件安装文档 |
| JDK 17 | 编译环境 | 配置 JAVA_HOME 环境变量 |
| Xcode | iOS 编译（仅 Mac） | 需要运行 iOS 时安装 |
| CocoaPods | iOS 依赖管理（仅 Mac） | `sudo gem install cocoapods` |

### Gradle JDK 切换

Android Studio 版本 ≥ 2024.2.1 时，默认 Gradle JDK 为 21，需手动切换为 JDK 17：

```
Android Studio → Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle JDK → 选择 JDK 17
```

### 忽略 iOS 编译（Windows / 无 Mac 环境）

若无需运行 iOS，在 `shared/build.gradle.kts` 中注释以下内容：

```kotlin
// 注释 plugins 中的：
// kotlin("native.cocoapods")

// 注释 kotlin {} 块中的：
// iosX64()
// iosArm64()
// iosSimulatorArm64()
// cocoapods { ... }
// val iosXxx 相关 sourceSet 配置

// 注释 dependencies 中的：
// add("kspIosArm64", this)
// add("kspIosX64", this)
// add("kspIosSimulatorArm64", this)
```

---

## 第二阶段：添加 KMP shared 模块

Kuikly 的跨端业务代码存放在 KMP shared 模块中。现有工程接入时，需要在现有工程中添加 shared 模块。

### 方式一：通过 Kuikly 脚手架插件创建（推荐）

如果现有工程可以用 Android Studio 打开：

1. Android Studio → **File → New → New Module → Kuikly Module Template**
2. 填写模块名（通常为 `shared`）、包名等信息，点击 Finish
3. 脚手架自动生成 `shared` 模块，包含 `@Page` 页面、`BasePager` 等基础代码
4. 在根 `settings.gradle.kts` 中确认已 `include(":shared")`

### 方式二：通过 Node 脚手架生成 shared 基线

如果无法使用脚手架插件，可先在临时目录生成一个最小接入工程，再把 `shared` 模块迁移进现有工程：

1. 在临时目录执行对应命令生成工程：
   - Kuikly DSL：`npx --yes @kuikly-ai/create-kuikly-app@latest --json create-integration TempApp --package com.example.tempapp`
   - Compose DSL：`npx --yes @kuikly-ai/create-kuikly-app@latest --json create-integration TempApp --dsl compose --package com.example.tempapp`
2. 将生成工程中的 `shared/` 目录复制到现有工程根目录
3. 在根 `settings.gradle.kts` 中添加 `include(":shared")`
4. 在宿主模块中添加 `implementation(project(":shared"))`
5. 按实际工程包名、namespace、版本号调整 `shared/build.gradle.kts` 与 `package` 声明

> 这样 `shared` 模块的初始结构由脚手架直接生成，可直接迁移到现有工程继续接入。

### 配置 shared 模块依赖

在 `shared/build.gradle.kts` 中配置 Kuikly 核心依赖：

```kotlin
plugins {
    kotlin("multiplatform")
    id("com.android.library")
    id("com.google.devtools.ksp")
    id("com.tencent.kuikly-open.kuikly")
    // Compose DSL 额外添加：
    // id("org.jetbrains.compose")
    // kotlin("plugin.compose")
}

kotlin {
    androidTarget { ... }
    // 按需配置 iOS / 鸿蒙 target
    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation("com.tencent.kuikly-open:core:${kuiklyVersion}")
                implementation("com.tencent.kuikly-open:core-annotations:${kuiklyVersion}")
                // Compose DSL 额外添加：
                // implementation("com.tencent.kuikly-open:compose:${kuiklyVersion}")
            }
        }
    }
}
```

### 在宿主模块中依赖 shared

在现有 Android 模块的 `build.gradle.kts` 中添加：

```kotlin
dependencies {
    implementation(project(":shared"))
}
```

### 检查版本号一致性

添加 shared 模块后，检查以下文件中的 Kuikly 版本号，确保各端一致：

| 文件 | 说明 |
|------|------|
| `shared/build.gradle.kts` | KMP 业务模块 |
| `androidApp/build.gradle.kts` | Android 宿主模块 |
| `iosApp/Podfile` | iOS 宿主工程（如有） |
| `ohosApp/entry/oh-package.json5` | 鸿蒙宿主工程（如有） |

> ⚠️ Kuikly 2.5.0 版本后需要添加 maven 源：
> ```kotlin
> maven("https://mirrors.tencent.com/repository/maven-tencent/")
> ```

### 验证 shared 模块

- **Android**：编译 `shared` 模块，确认无报错：`./gradlew :shared:assembleDebug`
- **iOS**：在 `shared` 模块配置 `cocoapods` 后，执行 `./gradlew :shared:podInstall`

---

## 第三阶段：Android 平台接入

> ⚠️ **以下所有操作均为新增文件和代码，不要修改用户原有的启动 Activity 或任何已有代码。** Kuikly 接入是非侵入式的，用户原有的页面流程不受影响，Kuikly 页面通过 `KuiklyRenderActivity.start()` 按需跳转进入。

### 3.1 添加渲染器依赖

在宿主模块的 `build.gradle` 中添加：

```gradle
dependencies {
    implementation("com.tencent.kuikly-open:core-render-android:KUIKLY_RENDER_VERSION")
    implementation("com.tencent.kuikly-open:core:KUIKLY_CORE_VERSION")
    // 其他依赖...
}
```

> ⚠️ `core-render-android` 和 `core` 的版本号必须与 KMP 工程保持一致。

### 3.2 实现承载容器

**新增** `KuiklyRenderActivity`（不要修改原有 Activity）：

```kotlin
class KuiklyRenderActivity : AppCompatActivity() {

    private lateinit var hrContainerView: ViewGroup
    private lateinit var kuiklyRenderViewDelegator: KuiklyRenderViewBaseDelegator
    private lateinit var contextCodeHandler: ContextCodeHandler

    protected val pageName: String
        get() = intent.getStringExtra(KEY_PAGE_NAME) ?: "router"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // 1. 创建页面打开封装处理器
        contextCodeHandler = ContextCodeHandler(pageName)
        // 2. 实例化 Kuikly 委托者
        kuiklyRenderViewDelegator = contextCodeHandler.initContextHandler()
        setContentView(R.layout.activity_hr)
        hrContainerView = findViewById(R.id.hr_container)
        // 3. 触发 Kuikly View 实例化
        contextCodeHandler.openPage(this, hrContainerView, pageName, createPageData())
    }

    override fun onResume() {
        super.onResume()
        kuiklyRenderViewDelegator.onResume()
    }

    override fun onPause() {
        super.onPause()
        kuiklyRenderViewDelegator.onPause()
    }

    override fun onDestroy() {
        super.onDestroy()
        kuiklyRenderViewDelegator.onDetach()
    }

    private fun createPageData(): Map<String, Any> = mutableMapOf("appId" to 1)

    companion object {
        private const val KEY_PAGE_NAME = "pageName"
        private const val KEY_PAGE_DATA = "pageData"

        fun start(context: Context, pageName: String, pageData: JSONObject) {
            val intent = Intent(context, KuiklyRenderActivity::class.java)
            intent.putExtra(KEY_PAGE_NAME, pageName)
            intent.putExtra(KEY_PAGE_DATA, pageData.toString())
            context.startActivity(intent)
        }
    }
}
```

对应的布局文件 `activity_hr.xml`：

```xml
<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <FrameLayout
        android:id="@+id/hr_container"
        android:layout_width="match_parent"
        android:layout_height="match_parent"/>

    <View
        android:id="@+id/hr_loading"
        android:layout_width="match_parent"
        android:layout_height="match_parent"/>

    <View
        android:id="@+id/hr_error"
        android:layout_width="match_parent"
        android:layout_height="match_parent"/>
</FrameLayout>
```

### 3.3 实现适配器（必须实现）

Kuikly 通过适配器模式将图片加载、日志、路由、线程等能力委托给宿主实现。

#### 图片加载适配器（必须）

```kotlin
object KRImageAdapter : IKRImageAdapter {
    override fun fetchDrawable(
        imageLoadOption: HRImageLoadOption,
        callback: (drawable: Drawable?) -> Unit
    ) {
        // 使用宿主图片库（如 Glide、Coil）加载图片
        // ⚠️ 此方法可能在非 UI 线程调用，注意线程安全
    }
}
```

#### 日志适配器（必须）

```kotlin
object KRLogAdapter : IKRLogAdapter {
    override val asyncLogEnable: Boolean get() = false

    override fun i(tag: String, msg: String) { Log.i(tag, msg) }
    override fun d(tag: String, msg: String) { Log.d(tag, msg) }
    override fun e(tag: String, msg: String) { Log.e(tag, msg) }
}
```

#### 页面路由适配器（必须）

```kotlin
object KRRouterAdapter : IKRRouterAdapter {
    override fun openPage(context: Context, pageName: String, pageData: JSONObject) {
        KuiklyRenderActivity.start(context, pageName, pageData)
    }

    override fun closePage(context: Context) {
        (context as? Activity)?.finish()
    }
}
```

#### 线程适配器（必须）

```kotlin
class KRThreadAdapter : IKRThreadAdapter {
    override fun executeOnSubThread(task: () -> Unit) {
        subThreadPoolExecutor.execute(task)
    }

    /**
     * Compose 场景下建议设置 8MB 以避免 StackOverflowException
     */
    override fun stackSize(): Long = 8 * 1024 * 1024
}

private val subThreadPoolExecutor by lazy {
    Executors.newFixedThreadPool(2)
}
```

#### 异常适配器（推荐）

```kotlin
object KRExceptionAdapter : IKRUncaughtExceptionHandlerAdapter {
    override fun uncaughtException(throwable: Throwable) {
        if (BuildConfig.DEBUG) {
            throw throwable
        } else {
            Log.e("KRError", throwable.stackTraceToString())
        }
    }
}
```

### 3.4 注册适配器

在 `KuiklyRenderActivity` 的 `companion object` 中初始化：

```kotlin
companion object {
    init {
        initKuiklyAdapter()
    }

    private fun initKuiklyAdapter() {
        with(KuiklyRenderAdapterManager) {
            krImageAdapter = KRImageAdapter
            krLogAdapter = KRLogAdapter
            krUncaughtExceptionHandlerAdapter = KRExceptionAdapter
            krRouterAdapter = KRRouterAdapter
            krThreadAdapter = KRThreadAdapter()
            // 按需实现其他适配器
            // krFontAdapter = KRFontAdapter
            // krColorParseAdapter = KRColorParserAdapter(application)
        }
    }
}
```

### 3.5 按需实现的适配器

#### 颜色值转换适配器

```kotlin
object KRColorAdapter : IKRColorParserAdapter {
    override fun toColor(colorStr: String): Int? {
        // 自定义颜色转换逻辑（如支持语义化颜色名）
        return null
    }
}
```

#### 自定义字体适配器

```kotlin
object KRFontAdapter : IKRFontAdapter {
    override fun getTypeface(fontFamily: String, result: (Typeface?) -> Unit) {
        val typeface = when (fontFamily) {
            "Satisfy-Regular" -> Typeface.createFromAsset(application.assets, "fonts/$fontFamily.ttf")
            else -> null
        }
        result(typeface)
    }

    // 固定 density，使布局不受系统"显示大小"设置影响
    override fun getDisplayMetrics(useHostDisplayMetrics: Boolean?): DisplayMetrics {
        return DisplayMetrics().apply {
            density = 2f
            scaledDensity = 2f
        }
    }
}
```

---

## 第四阶段：iOS 平台接入

### 4.1 添加渲染器依赖

#### 方式一：CocoaPods（推荐）

在 `Podfile` 中添加：

```ruby
source 'https://cdn.cocoapods.org/'
platform :ios, '14.1'

target 'KuiklyTest' do
  inhibit_all_warnings!
  pod 'OpenKuiklyIOSRender', 'KUIKLY_RENDER_VERSION'
  # 链接业务代码（本地路径）
  pod 'shared', :path => '/path/to/your/KMP/shared'
end
```

执行 `pod install --repo-update` 安装依赖。

#### 方式二：SPM（Swift Package Manager）

1. Xcode → Project → Package Dependencies → 点击 **+**
2. 输入仓库地址：`https://github.com/Tencent-TDS/KuiklyUI.git`
3. 选择与 KMP 工程一致的版本，点击 Add Package

业务 `.xcframework` 推荐封装为本地 Swift Package：

```swift
// Package.swift
.binaryTarget(
    name: "shared",
    path: "./shared.xcframework"
)
```

### 4.2 实现承载容器

#### 方式一：UIViewController 方式（推荐）

```objc
// KuiklyRenderViewController.h
@interface KuiklyRenderViewController : UIViewController
- (instancetype)initWithPageName:(NSString *)pageName pageData:(NSDictionary *)pageData;
@end
```

```objc
// KuiklyRenderViewController.m
#import <OpenKuiklyIOSRender/KuiklyRenderViewControllerBaseDelegator.h>

@interface KuiklyRenderViewController()<KuiklyRenderViewControllerBaseDelegatorDelegate>
@property (nonatomic, strong) KuiklyRenderViewControllerBaseDelegator *delegator;
@end

@implementation KuiklyRenderViewController

- (instancetype)initWithPageName:(NSString *)pageName pageData:(NSDictionary *)pageData {
    if (self = [super init]) {
        // ⚠️ 必须使用 KuiklyRenderViewControllerDelegator，不要使用 BaseDelegator
        _delegator = [[KuiklyRenderViewControllerDelegator alloc] initWithPageName:pageName pageData:pageData];
        _delegator.delegate = self;
    }
    return self;
}

- (void)viewDidLoad {
    [super viewDidLoad];
    self.view.backgroundColor = [UIColor whiteColor];
    [_delegator viewDidLoadWithView:self.view];
}

- (void)viewDidLayoutSubviews {
    [super viewDidLayoutSubviews];
    [_delegator viewDidLayoutSubviews];
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    [_delegator viewWillAppear];
}

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    [_delegator viewDidAppear];
}

- (void)viewWillDisappear:(BOOL)animated {
    [super viewWillDisappear:animated];
    [_delegator viewWillDisappear];
}

- (void)viewDidDisappear:(BOOL)animated {
    [super viewDidDisappear:animated];
    [_delegator viewDidDisappear];
}

#pragma mark - KuiklyRenderViewControllerBaseDelegatorDelegate

- (UIView *)createLoadingView {
    UIView *v = [[UIView alloc] init];
    v.backgroundColor = [UIColor whiteColor];
    return v;
}

- (UIView *)createErrorView {
    UIView *v = [[UIView alloc] init];
    v.backgroundColor = [UIColor whiteColor];
    return v;
}

// 返回业务代码编译成的 framework 名字
- (void)fetchContextCodeWithPageName:(NSString *)pageName resultCallback:(KuiklyContextCodeCallback)callback {
    if (callback) {
        callback(@"shared", nil);
    }
}

@end
```

> ⚠️ **必须使用 `KuiklyRenderViewControllerDelegator`**，不要使用 `KuiklyRenderViewControllerBaseDelegator`，否则会导致功能异常。

### 4.3 实现适配器（必须实现）

#### 图片加载适配器（必须）

```objc
// KuiklyRenderComponentExpandHandler.m
#import <SDWebImage/UIImageView+WebCache.h>

@implementation KuiklyRenderComponentExpandHandler

+ (void)load {
    [KuiklyRenderBridge registerComponentExpandHandler:[self new]];
}

// ✅ 推荐方法（带 src 一致性验证）
- (BOOL)hr_setImageWithUrl:(NSString *)loadURL
               imageParams:(NSDictionary *)imageParams
                  complete:(ImageCompletionBlock)completeBlock {
    // ⚠️ SDWebImage 需设置 SDWebImageAvoidAutoSetImage，避免图片错乱
    [[SDWebImageManager sharedManager]
        loadImageWithURL:[NSURL URLWithString:loadURL]
                 options:SDWebImageAvoidAutoSetImage
                progress:nil
               completed:^(UIImage *image, NSData *data, NSError *error,
                           SDImageCacheType cacheType, BOOL finished, NSURL *imageURL) {
        if (completeBlock) {
            // ⚠️ 传入的 imageURL 必须是原始参数 loadURL，不是 SDWebImage 回调的 imageURL
            completeBlock(image, error, [NSURL URLWithString:loadURL]);
        }
    }];
    return YES;
}

@end
```

#### 页面路由适配器（必须）

```objc
// KRRouterHandler.m
@implementation KRRouterHandler

+ (void)load {
    [KRRouterModule registerRouterHandler:[self new]];
}

- (void)openPageWithName:(NSString *)pageName
                pageData:(NSDictionary *)pageData
              controller:(UIViewController *)controller {
    KuiklyRenderViewController *vc = [[KuiklyRenderViewController alloc]
        initWithPageName:pageName pageData:pageData];
    [controller.navigationController pushViewController:vc animated:YES];
}

- (void)closePage:(UIViewController *)controller {
    [controller.navigationController popViewControllerAnimated:YES];
}

@end
```

#### 日志适配器（推荐）

```objc
@implementation KuiklyLogHandler

- (BOOL)asyncLogEnable { return NO; }

- (void)logInfo:(NSString *)message { NSLog(@"%@", message); }

- (void)logDebug:(NSString *)message {
#if DEBUG
    NSLog(@"%@", message);
#endif
}

- (void)logError:(NSString *)message { NSLog(@"%@", message); }

@end
```

#### 异常适配器（推荐）

重写 `KuiklyRenderViewControllerBaseDelegatorDelegate` 的异常方法：

```objc
- (void)onUnhandledException:(NSString *)exReason
                       stack:(NSString *)callstackStr
                        mode:(KuiklyContextMode)mode {
    // 处理异常或上报
}
```

### 4.4 按需实现的适配器

#### APNG 图片加载适配器

```objc
@implementation KRAPNGViewHandler

+ (void)load {
    [KRAPNGView registerAPNGViewCreator:^id<APNGImageViewProtocol>(CGRect frame) {
        return [[KRAPNGViewHandler alloc] initWithFrame:frame];
    }];
}

@end
```

---

## 第四阶段（鸿蒙）：鸿蒙平台接入

> ⚠️ 在此之前请确保已完成 KMP 侧 Kuikly 的接入（第二阶段）。鸿蒙模拟器不支持 X86 版的 Mac，推荐使用 Apple Silicon (Arm) 版的 Mac 进行鸿蒙开发。

### 5.1 添加渲染器依赖

编辑 entry 模块的 `oh-package.json5`，添加 Kuikly 渲染器依赖：

```json5
// entry/oh-package.json5
{
  ...
  "dependencies": {
    ...
    "@kuikly-open/render": "KUIKLY_RENDER_VERSION"
  }
}
```

> ⚠️ `KUIKLY_RENDER_VERSION` 需替换为实际版本号，且必须与 KMP 工程保持一致。

点击右上角 **Sync Now**（或在 entry 目录下执行 `ohpm install`）。

### 5.2 创建鸿蒙运行时初始化接口

Kuikly 鸿蒙端渲染基于 ArkUI C-API 实现，需要通过 NAPI 将运行时初始化接口暴露到 ArkTS 层。

#### 添加 C++（NAPI）支持

在鸿蒙工程 entry 模块添加 C++（NAPI）支持：右键点击 entry 目录 → **New → Native C++**。

#### 添加 NAPI 初始化入口函数

在 `entry/src/main/cpp/napi_init.cpp` 中添加 `InitKuikly` 初始化入口：

```c++
// entry/src/main/cpp/napi_init.cpp
#include "napi/native_api.h"

static napi_value InitKuikly(napi_env env, napi_callback_info info) {
    // 添加业务代码初始化逻辑，具体见后续「链接 Kuikly 业务代码」步骤
    return nullptr;
}

EXTERN_C_START
static napi_value Init(napi_env env, napi_value exports) {
    napi_property_descriptor desc[] = {
        {"initKuikly", nullptr, InitKuikly, nullptr, nullptr, nullptr, napi_default, nullptr},
    };
    napi_define_properties(env, exports, sizeof(desc) / sizeof(desc[0]), desc);
    return exports;
}
EXTERN_C_END

static napi_module demoModule = {
    .nm_version = 1,
    .nm_flags = 0,
    .nm_filename = nullptr,
    .nm_register_func = Init,
    .nm_modname = "entry",
    .nm_priv = ((void*)0),
    .reserved = { 0 },
};

extern "C" __attribute__((constructor)) void RegisterEntryModule(void) {
    napi_module_register(&demoModule);
}
```

在 `entry/src/main/cpp/types/libentry/index.d.ts` 中声明接口：

```ts
// entry/src/main/cpp/types/libentry/index.d.ts
export const initKuikly: () => number;
```

#### 关联 NativeManager

在 `entry/src/main/ets/kuikly/` 下创建 `MyNativeManager.ets`：

```ts
// entry/src/main/ets/kuikly/MyNativeManager.ets
import { KuiklyNativeManager } from '@kuikly-open/render';
import Napi from 'libentry.so';

class MyNativeManager extends KuiklyNativeManager {
  protected loadNative(): number {
    return Napi.initKuikly();
  }
}

const globalNativeManager = new MyNativeManager();
export default globalNativeManager;
```

### 5.3 实现承载容器

#### 创建委托类

在 `entry/src/main/ets/kuikly/` 下创建 `KuiklyViewDelegate.ets`，用于注册自定义 Module：

```ts
// entry/src/main/ets/kuikly/KuiklyViewDelegate.ets
import { IKuiklyViewDelegate, KRRenderModuleExportCreator } from '@kuikly-open/render';
import { KRBridgeModule } from './modules/KRBridgeModule';

export class KuiklyViewDelegate extends IKuiklyViewDelegate {
  // 注册自定义 Module
  getCustomRenderModuleCreatorRegisterMap(): Map<string, KRRenderModuleExportCreator> {
    const map: Map<string, KRRenderModuleExportCreator> = new Map();
    map.set(KRBridgeModule.MODULE_NAME, () => new KRBridgeModule());
    return map;
  }
}
```

#### 实现 Kuikly 承载页面

在 `entry/src/main/ets/pages/Index.ets` 中使用 `Kuikly` 组件：

```ts
// entry/src/main/ets/pages/Index.ets
import { KRRecord, Kuikly } from '@kuikly-open/render';
import router from '@ohos.router';
import { KuiklyViewDelegate } from '../kuikly/KuiklyViewDelegate';
import globalNativeManager from '../kuikly/MyNativeManager';

@Entry
@Component
struct Index {
  private kuiklyViewDelegate = new KuiklyViewDelegate();
  private pageName: string | null = null;
  private pageData?: KRRecord;

  aboutToAppear(): void {
    const params = router.getParams() as Record<string, Object>;
    this.pageName = params?.pageName as string;
    this.pageData = (params?.pageData as KRRecord | null) ?? {};
  }

  build() {
    Stack() {
      Kuikly({
        pageName: this.pageName ?? 'router',
        pageData: this.pageData ?? {},
        delegate: this.kuiklyViewDelegate,
        nativeManager: globalNativeManager,
      })
    }
    .width('100%').height('100%')
    .expandSafeArea([SafeAreaType.KEYBOARD])
  }

  // 生命周期转发
  onPageShow(): void { this.kuiklyViewDelegate.pageDidAppear(); }
  onPageHide(): void { this.kuiklyViewDelegate.pageDidDisappear(); }
}
```

`Kuikly` 组件参数说明：

| 参数 | 说明 |
|------|------|
| `pageName` | 页面名称，对应 `@Page` 注解中定义的名称 |
| `pageData` | 页面数据，传递给 Kuikly 页面的参数 |
| `delegate` | 委托者实现，用于注册自定义 Module |
| `nativeManager` | 原生管理器实例 |
| `initialSize` | （可选）初始尺寸 `{ width, height }`，提前跨端页面创建 |
| `onControllerReadyCallback` | （可选）控制器就绪回调 |

### 5.4 实现适配器（必须实现）

#### 日志适配器（推荐）

```ts
// entry/src/main/ets/kuikly/adapter/LogAdapter.ets
import { IKRLogAdapter } from '@kuikly-open/render';
import hilog from '@ohos.hilog';

export class LogAdapter implements IKRLogAdapter {
  i(tag: string, msg: string): void {
    hilog.info(0x30, tag, '%{public}s', msg);
  }
  d(tag: string, msg: string): void {
    hilog.debug(0x30, tag, '%{public}s', msg);
  }
  e(tag: string, msg: string): void {
    hilog.error(0x30, tag, '%{public}s', msg);
  }
}
```

#### 页面路由适配器（必须）

```ts
// entry/src/main/ets/kuikly/adapter/RouterAdapter.ets
import { IKRRouterAdapter, KRRecord } from '@kuikly-open/render';
import router from '@ohos.router';
import { common } from '@kit.AbilityKit';

export class RouterAdapter implements IKRRouterAdapter {
  openPage(context: common.UIAbilityContext, pageName: string, pageData: KRRecord): void {
    router.pushUrl({
      url: 'pages/Index',
      params: { pageName, pageData }
    });
  }
  closePage(context: common.UIAbilityContext): void {
    router.back();
  }
}
```

#### 初始化适配器

在 `EntryAbility.ets` 的 `onWindowStageCreate` 中注册适配器：

```ts
// entry/src/main/ets/entryability/EntryAbility.ets
import { KuiklyRenderAdapterManager } from '@kuikly-open/render';
import { LogAdapter } from '../kuikly/adapter/LogAdapter';
import { RouterAdapter } from '../kuikly/adapter/RouterAdapter';

export default class EntryAbility extends UIAbility {
  onWindowStageCreate(windowStage: window.WindowStage): void {
    windowStage.getMainWindowSync().setWindowLayoutFullScreen(true);

    // 注册适配器
    KuiklyRenderAdapterManager.krLogAdapter = new LogAdapter();
    KuiklyRenderAdapterManager.krRouterAdapter = new RouterAdapter();

    windowStage.loadContent('pages/Index', (err, data) => { ... });
  }
}
```

> 多 ability 场景可把初始化时机提前到 `AbilityStage`，避免相互覆盖。

### 5.5 实现业务 Module（可选）

继承 `KuiklyRenderBaseModule`，实现原生能力供 Kotlin 侧调用：

```ts
// entry/src/main/ets/kuikly/modules/KRBridgeModule.ets
import { KuiklyRenderBaseModule, KRRenderModuleMethodCallback } from '@kuikly-open/render';
import router from '@ohos.router';

export class KRBridgeModule extends KuiklyRenderBaseModule {
  static readonly MODULE_NAME = 'HRBridgeModule';

  toast(params: string, callback: KRRenderModuleMethodCallback): void {
    // 展示 Toast
  }

  closePage(params: string, callback: KRRenderModuleMethodCallback): void {
    router.back();
  }
}
```

### 5.6 链接 Kuikly 业务代码

Kuikly 业务代码在鸿蒙平台编译为 `.so` 产物，需链接到鸿蒙工程。

#### 生成 so 产物和头文件

在 KMP 工程中执行：

```bash
./gradlew -c settings.ohos.gradle.kts :shared:linkOhosArm64
```

#### 拷贝业务产物

将生成的 `libshared.so` 和头文件 `libshared_api.h` 拷贝到 C++ 模块目录中。

#### 修改 CMakeLists.txt

```cmake
set(NATIVERENDER_ROOT_PATH ${CMAKE_CURRENT_SOURCE_DIR})

# Kuikly SDK
add_library(kuikly_render ALIAS render::kuikly)
# 业务产物
add_library(kuikly_shared SHARED IMPORTED)
set_target_properties(kuikly_shared
    PROPERTIES
    IMPORTED_LOCATION ${NATIVERENDER_ROOT_PATH}/../../../libs/${OHOS_ARCH}/libshared.so)
# 链接到入口模块
target_link_libraries(entry PUBLIC libace_napi.z.so kuikly_shared kuikly_render)
```

#### 实现 InitKuikly 函数

```c++
// entry/src/main/cpp/napi_init.cpp
#include "libshared_api.h"
#include "napi/native_api.h"

static napi_value InitKuikly(napi_env env, napi_callback_info info) {
  auto api = libshared_symbols();
  int handler = api->kotlin.root.initKuikly();
  napi_value result;
  napi_create_int32(env, handler, &result);
  return result;
}
```

#### 拷贝资源文件（如有）

将 `shared/src/commonMain/assets/` 下的资源拷贝到 `entry/src/main/resources/resfile/`。

### 5.7 按需实现的适配器

#### 图片加载适配器（C++ 层）

通过 `KRRegisterImageAdapterV2` 或 `KRRegisterImageAdapterV3` 注册：

```c++
// entry/src/main/cpp/napi_init.cpp
#include <Kuikly/Kuikly.h>

// V3 实现（支持 imageParams）
static int32_t MyImageAdapterV3(const void *context, const char *src,
    KRAnyData *imageParams, KRSetImageCallback callback) {
    // 自定义图片加载逻辑
    return 0;  // 返回 1 表示已处理
}

static napi_value InitKuikly(napi_env env, napi_callback_info info) {
    KRRegisterImageAdapterV3(MyImageAdapterV3);
    // ...
}
```

> V3 优先级高于 V2。`imageParams` 为跨端侧传入的 JSONObject，可通过 `KRAnyDataVisitMap` 遍历。

#### 自定义字体适配器（C++ 层）

通过 `KRRegisterFontAdapter` 注册：

```c++
static char *MyFontAdapter(const char *fontFamily, char **fontBuffer,
    size_t *len, KRFontDataDeallocator *deallocator) {
    if (isEqual(fontFamily, "Satisfy-Regular")) {
        return "rawfile:Satisfy-Regular.ttf";
    }
    return (char *)customFontPath.c_str();
}

static napi_value InitKuikly(napi_env env, napi_callback_info info) {
    KRRegisterFontAdapter(MyFontAdapter, "Satisfy-Regular");
    // ...
}
```

#### 颜色值转换适配器（C++ 层）

通过 `KRRegisterColorAdapter` 注册：

```c++
static int64_t MyColorAdapter(const char* str) {
    // 自定义颜色解析，返回 -1 则由 Kuikly 自动转换
    return -1;
}

static napi_value InitKuikly(napi_env env, napi_callback_info info) {
    KRRegisterColorAdapter(MyColorAdapter);
    // ...
}
```

---

## 第五阶段：编写 TestPage 验证接入

在 KMP 工程的 `shared` 模块中新建 `TestPage`：

```kotlin
@Page("test")
class TestPage : Pager() {
    override fun body(): ViewBuilder {
        return {
            attr {
                allCenter()
                backgroundColor(Color.WHITE)
            }

            Text {
                attr {
                    fontSize(20f)
                    color(Color.GREEN)
                    text("Hello Kuikly")
                }
            }
        }
    }
}
```

### Android 验证

在用户**原有页面**中（如某个按钮的点击事件），通过以下方式跳转到 Kuikly 页面进行验证，**不要修改启动 Activity**：

```kotlin
// 在原有页面的任意位置（如按钮点击事件中）调用
KuiklyRenderActivity.start(context, "test", JSONObject())
```

### iOS 验证

```objc
KuiklyRenderViewController *vc = [[KuiklyRenderViewController alloc]
    initWithPageName:@"test" pageData:nil];
[self.navigationController pushViewController:vc animated:YES];
```

出现绿色 "Hello Kuikly" 文字即接入成功。

---

## 将业务代码集成到现有工程

### Android

1. 在 KMP 工程执行：`./gradlew :shared:bundleDebugAar`
2. 产物位于 `shared/build/output/aar/`
3. 将 AAR 以本地依赖或远程依赖方式集成到宿主工程

### iOS

1. 在 KMP 工程执行 Kotlin/Native 编译，生成 `shared.xcframework`
2. 通过本地 Pod 或 SPM 集成到宿主工程

---

## 接入检查清单

### Android

```
- [ ] 添加 core-render-android 和 core 依赖（版本与 KMP 一致）
- [ ] 实现 KuiklyRenderActivity
- [ ] 实现图片加载适配器（IKRImageAdapter）
- [ ] 实现日志适配器（IKRLogAdapter）
- [ ] 实现页面路由适配器（IKRRouterAdapter）
- [ ] 实现线程适配器（IKRThreadAdapter）
- [ ] 在 companion object init 中注册所有适配器
- [ ] 编写 TestPage 验证接入成功
```

### iOS

```
- [ ] Podfile 添加 OpenKuiklyIOSRender 依赖（版本与 KMP 一致）
- [ ] 执行 pod install --repo-update
- [ ] 实现 KuiklyRenderViewController（使用 KuiklyRenderViewControllerDelegator）
- [ ] 实现图片加载适配器（hr_setImageWithUrl:imageParams:complete:）
- [ ] 实现页面路由适配器（KRRouterHandler）
- [ ] fetchContextCodeWithPageName: 返回正确的 framework 名字（"shared"）
- [ ] 链接业务代码 .xcframework 或 Pod
- [ ] 编写 TestPage 验证接入成功
```

### 鸿蒙

```
- [ ] oh-package.json5 添加 @kuikly-open/render 依赖（版本与 KMP 一致）
- [ ] 添加 C++（NAPI）支持，实现 napi_init.cpp 中的 InitKuikly 入口
- [ ] 创建 MyNativeManager.ets 关联 KuiklyNativeManager
- [ ] 创建 KuiklyViewDelegate.ets 注册自定义 Module
- [ ] 实现 Kuikly 承载页面（pages/Index.ets）
- [ ] 实现日志适配器（IKRLogAdapter）
- [ ] 实现页面路由适配器（IKRRouterAdapter）
- [ ] 在 EntryAbility.onWindowStageCreate 中注册适配器
- [ ] 编译 so 产物并链接到鸿蒙工程（CMakeLists.txt）
- [ ] 拷贝资源文件到 entry/src/main/resources/resfile/
- [ ] 编写 TestPage 验证接入成功
```

---

## Kuikly 资源与支持

### 官方资源

| 资源 | 链接 |
|------|------|
| **官方文档** | [https://kuikly.tds.qq.com/DevGuide/dev-guide-overview.html](https://kuikly.tds.qq.com/DevGuide/dev-guide-overview.html) |
| **GitHub 仓库** | [https://github.com/Tencent-TDS/KuiklyUI](https://github.com/Tencent-TDS/KuiklyUI) |
| **版本变更日志** | [https://kuikly.tds.qq.com/ChangeLog/changelog.html](https://kuikly.tds.qq.com/ChangeLog/changelog.html) |

> 欢迎在 GitHub 上 Star 支持 Kuikly 开源项目！如在使用中遇到问题，也欢迎提 Issue。

### 本地文档索引

- **环境搭建** → `docs/QuickStart/env-setup.md`
- **KMP 工程接入** → `docs/QuickStart/common.md`
- **Android 接入** → `docs/QuickStart/android.md`
- **iOS 接入** → `docs/QuickStart/iOS.md`
- **鸿蒙接入** → `docs/QuickStart/harmony.md`
- **H5 接入** → `docs/QuickStart/h5.md`
- **小程序接入** → `docs/QuickStart/Miniapp.md`
- **第一个页面** → `docs/QuickStart/hello-world.md`
- **扩展原生 View** → `skills/expanding-native-view/SKILL.md`
- **扩展原生 API** → `skills/expanding-native-api/SKILL.md`

### 联系小助手

当遇到以下情况时，建议联系 Kuikly 小助手获取帮助：

- **动态化发布** — 动态化能力、远程动态发布流程、版本灰度策略等问题
- **复杂问题排查** — 接入过程中遇到的疑难杂症，本文档未覆盖的场景
- **高级能力咨询** — 性能调优、自定义渲染管线、跨端通信等深入话题
- **业务接入对接** — 大规模业务接入需要官方支持

> 📬 请通过官方文档或 GitHub 仓库页面提供的小助手联系方式与我们取得联系。
