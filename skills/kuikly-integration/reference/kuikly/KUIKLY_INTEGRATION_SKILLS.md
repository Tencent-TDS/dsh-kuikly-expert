# Kuikly 工程接入 Skills

> 基于本模版工程（`com.example.kuiklydsl`）总结，适用于将 Kuikly 跨端框架接入新业务工程。

---

## 架构总览

```
┌─────────────────────────────────────────────┐
│           shared 模块（KMP 共享层）            │
│  @Page 页面 / BasePager / BridgeModule / KSP  │
└──────────┬──────────────┬────────────────────┘
           │              │              │
    ┌──────▼──────┐ ┌─────▼──────┐ ┌────▼──────┐
    │  Android 端  │ │   iOS 端   │ │  鸿蒙端   │
    │  Adapter ×6  │ │  Handler   │ │  Adapter  │
    │  Module      │ │  Module    │ │  Module   │
    │  Activity    │ │  VC        │ │  Kuikly组件│
    └─────────────┘ └────────────┘ └───────────┘
```

---

## 一、shared 模块接入

### 1.1 插件与依赖配置（`shared/build.gradle.kts`）

```kotlin
plugins {
    kotlin("multiplatform")
    kotlin("native.cocoapods")
    id("com.android.library")
    id("com.google.devtools.ksp")
    id("com.tencent.kuikly-open.kuikly")   // Kuikly 构建插件
}

kotlin {
    androidTarget { ... }
    iosX64(); iosArm64(); iosSimulatorArm64()

    cocoapods {
        version = "1.0"
        ios.deploymentTarget = "14.1"
        podfile = project.file("../iosApp/Podfile")
        framework {
            baseName = "shared"          // iOS framework 名，VC 中 callback 返回此值
            isStatic = true
        }
    }

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation("com.tencent.kuikly-open:core:${kuiklyVersion}")
                implementation("com.tencent.kuikly-open:core-annotations:${kuiklyVersion}")
            }
        }
        val androidMain by getting {
            dependencies {
                api("com.tencent.kuikly-open:core-render-android:${kuiklyVersion}")
            }
        }
    }
}

// KSP 处理器（自动收集 @Page 注解）
dependencies {
    compileOnly("com.tencent.kuikly-open:core-ksp:${kuiklyVersion}") {
        add("kspAndroid", this)
        add("kspIosArm64", this)
        add("kspIosX64", this)
        add("kspIosSimulatorArm64", this)
        add("kspJs", this)
    }
}
```

### 1.2 基础类

**BasePager.kt** — 所有页面的基类：
```kotlin
// shared/src/commonMain/kotlin/.../base/BasePager.kt
abstract class BasePager : Pager() {
    override fun getExternalModules(): List<Module> {
        return listOf(BridgeModule(pagerId))
    }
}
```

**BridgeModule.kt** — Kotlin 侧调用原生能力的桥接模块：
```kotlin
// shared/src/commonMain/kotlin/.../base/BridgeModule.kt
class BridgeModule(pagerId: String) : Module() {
    fun toast(msg: String) = callNativeMethod("HRBridgeModule", "toast", msg)
    fun log(msg: String)   = callNativeMethod("HRBridgeModule", "log", msg)
    fun closePage()        = callNativeMethod("HRBridgeModule", "closePage", "")
}
```

**IPagerIdKtx.kt** — 扩展属性，页面中直接用 `bridgeModule.xxx()`：
```kotlin
val Pager.bridgeModule: BridgeModule
    get() = acquireModule(BridgeModule.MODULE_NAME)
```

### 1.3 页面注册

用 `@Page` 注解标记页面，KSP 自动收集注册，**无需手动注册**：

```kotlin
// shared/src/commonMain/kotlin/.../RouterPage.kt
@Page("router", supportInLocal = true)
internal class RouterPage : BasePager() {
    override fun body(): ViewBuilder = {
        // 使用 Kuikly DSL 构建 UI
        Text {
            attr { text("Hello Kuikly") }
        }
    }
}
```

---

## 二、Android 端接入

### 2.1 Application（`KRApplication.kt`）

持有全局 Context，供 Adapter 使用：

```kotlin
class KRApplication : Application() {
    init { application = this }
    companion object {
        lateinit var application: Application
    }
}
```

在 `AndroidManifest.xml` 中声明：
```xml
<application android:name=".KRApplication" ...>
```

### 2.2 Adapter 适配器（必须全部实现）

在 `adapter/` 目录下实现以下 6 个适配器：

| 接口 | 实现类 | 说明 |
|---|---|---|
| `IKRImageAdapter` | `KRImageAdapter` | 图片加载，使用 Glide，支持 http/base64/assets/file |
| `IKRLogAdapter` | `KRLogAdapter` | 日志，桥接 `android.util.Log` |
| `IKRRouterAdapter` | `KRRouterAdapter` | 路由，调用 `KuiklyRenderActivity.start()` |
| `IKRFontAdapter` | `KRFontAdapter` | 自定义字体加载 |
| `IKRThreadAdapter` | `KRThreadAdapter` | 子线程调度，`Executors.newFixedThreadPool(2)` |
| `IKRUncaughtExceptionHandlerAdapter` | `KRUncaughtExceptionHandlerAdapter` | 未捕获异常处理 |

**KRRouterAdapter 示例：**
```kotlin
object KRRouterAdapter : IKRRouterAdapter {
    override fun openPage(context: Context, pageName: String, pageData: JSONObject) {
        KuiklyRenderActivity.start(context, pageName, pageData)
    }
    override fun closePage(activity: Activity) {
        activity.finish()
    }
}
```

### 2.3 Module 业务模块（`module/` 目录）

继承 `KuiklyRenderBaseModule`，实现原生能力供 Kotlin 侧调用：

```kotlin
class KRBridgeModule : KuiklyRenderBaseModule() {
    companion object { const val MODULE_NAME = "HRBridgeModule" }

    @KuiklyRenderModuleMethod
    fun toast(params: String, callback: KuiklyRenderCallback?) {
        Toast.makeText(KRApplication.application, params, Toast.LENGTH_SHORT).show()
    }

    @KuiklyRenderModuleMethod
    fun closePage(params: String, callback: KuiklyRenderCallback?) {
        (context as? Activity)?.finish()
    }
}
```

### 2.4 KuiklyRenderActivity（核心渲染容器）

```kotlin
class KuiklyRenderActivity : AppCompatActivity(), KuiklyRenderViewBaseDelegatorDelegate {

    private val kuiklyRenderViewDelegator = KuiklyRenderViewBaseDelegator(this)

    private val pageName: String
        get() = intent.getStringExtra(KEY_PAGE_NAME) ?: "router"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_hr)
        val container = findViewById<ViewGroup>(R.id.hr_container)
        // 启动渲染，传入容器、pageName、pageData
        kuiklyRenderViewDelegator.onAttach(container, "", pageName, createPageData())
    }

    override fun onResume()  { super.onResume();  kuiklyRenderViewDelegator.onResume() }
    override fun onPause()   { super.onPause();   kuiklyRenderViewDelegator.onPause() }
    override fun onDestroy() { super.onDestroy(); kuiklyRenderViewDelegator.onDetach() }

    // 注册自定义 Module
    override fun registerExternalModule(kuiklyRenderExport: IKuiklyRenderExport) {
        super.registerExternalModule(kuiklyRenderExport)
        kuiklyRenderExport.moduleExport(KRBridgeModule.MODULE_NAME) { KRBridgeModule() }
    }

    // 注册自定义 View（可选）
    override fun registerExternalRenderView(kuiklyRenderExport: IKuiklyRenderExport) {
        super.registerExternalRenderView(kuiklyRenderExport)
    }

    companion object {
        private const val KEY_PAGE_NAME = "pageName"
        private const val KEY_PAGE_DATA = "pageData"

        // 静态初始化块：注册所有 Adapter
        init {
            with(KuiklyRenderAdapterManager) {
                krImageAdapter = KRImageAdapter(KRApplication.application)
                krLogAdapter = KRLogAdapter
                krRouterAdapter = KRRouterAdapter
                krFontAdapter = KRFontAdapter
                krThreadAdapter = KRThreadAdapter()
                krUncaughtExceptionHandlerAdapter = KRUncaughtExceptionHandlerAdapter
            }
        }

        // 跳转入口
        fun start(context: Context, pageName: String, pageData: JSONObject) {
            context.startActivity(Intent(context, KuiklyRenderActivity::class.java).apply {
                putExtra(KEY_PAGE_NAME, pageName)
                putExtra(KEY_PAGE_DATA, pageData.toString())
            })
        }
    }
}
```

### 2.5 布局文件（`res/layout/activity_hr.xml`）

```xml
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <FrameLayout
        android:id="@+id/hr_container"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

    <View android:id="@+id/hr_loading" ... />
    <View android:id="@+id/hr_error" ... />
</FrameLayout>
```

### 2.6 AndroidManifest.xml

```xml
<application android:name=".KRApplication">
    <activity
        android:name=".KuiklyRenderActivity"
        android:exported="true"
        android:windowSoftInputMode="adjustResize">
        <intent-filter>
            <action android:name="android.intent.action.MAIN" />
            <category android:name="android.intent.category.LAUNCHER" />
        </intent-filter>
    </activity>
</application>
```

### 2.7 build.gradle.kts（androidApp 模块）

```kotlin
dependencies {
    implementation(project(":shared"))
    implementation("com.github.bumptech.glide:glide:4.x.x")  // 图片加载
}
```

---

## 三、iOS 端接入

### 3.1 依赖配置（`Podfile`）

```ruby
source 'https://cdn.cocoapods.org/'

target 'iosApp' do
  use_frameworks!
  platform :ios, '14.1'
  pod 'OpenKuiklyIOSRender', '~> 2.22.0'   # Kuikly iOS 渲染库
  pod 'shared', :path => '../shared'       # KMP shared 框架
  pod 'SDWebImage'                         # 图片加载
end
```

执行 `pod install` 后使用 `.xcworkspace` 打开工程。

### 3.2 Bridging Header（`iosApp-Bridging-Header.h`）

```objc
#import "KuiklyRenderViewController.h"
```

### 3.3 KuiklyRenderViewController（OC 渲染容器）

**KuiklyRenderViewController.h：**
```objc
#import <UIKit/UIKit.h>

@interface KuiklyRenderViewController : UIViewController
- (instancetype)initWithPageName:(NSString *)pageName
                        pageData:(NSDictionary *)pageData;
@end
```

**KuiklyRenderViewController.m：**
```objc
#import <OpenKuiklyIOSRender/KuiklyRenderViewControllerBaseDelegator.h>

@interface KuiklyRenderViewController()<KuiklyRenderViewControllerBaseDelegatorDelegate>
@property (nonatomic, strong) KuiklyRenderViewControllerBaseDelegator *delegator;
@end

@implementation KuiklyRenderViewController

- (instancetype)initWithPageName:(NSString *)pageName pageData:(NSDictionary *)pageData {
    if (self = [super init]) {
        _delegator = [[KuiklyRenderViewControllerBaseDelegator alloc]
                      initWithPageName:pageName pageData:pageData];
        _delegator.delegate = self;
    }
    return self;
}

// 生命周期转发给 delegator
- (void)viewDidLoad          { [super viewDidLoad]; [_delegator viewDidLoadWithView:self.view]; }
- (void)viewDidLayoutSubviews{ [super viewDidLayoutSubviews]; [_delegator viewDidLayoutSubviews]; }
- (void)viewWillAppear:(BOOL)a{ [super viewWillAppear:a]; [_delegator viewWillAppear]; }
- (void)viewDidAppear:(BOOL)a { [super viewDidAppear:a];  [_delegator viewDidAppear]; }
- (void)viewWillDisappear:(BOOL)a{ [super viewWillDisappear:a]; [_delegator viewWillDisappear]; }
- (void)viewDidDisappear:(BOOL)a { [super viewDidDisappear:a];  [_delegator viewDidDisappear]; }

#pragma mark - KuiklyRenderViewControllerBaseDelegatorDelegate

// 返回 shared framework 名（与 cocoapods baseName 一致）
- (void)fetchContextCodeWithPageName:(NSString *)pageName
                      resultCallback:(KuiklyContextCodeCallback)callback {
    if (callback) { callback(@"shared", nil); }
}

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

@end
```

### 3.4 Handler 层（`KuiklyExpand/Handler/`）

**KRRouterHandler.m** — 路由处理，`+load` 自动注册：
```objc
@implementation KRRouterHandler

+ (void)load {
    [KRRouterModule registerRouterHandler:[self new]];
}

- (void)openPageWithName:(NSString *)pageName
                pageData:(NSDictionary *)pageData
              controller:(UIViewController *)controller {
    KuiklyRenderViewController *vc =
        [[KuiklyRenderViewController alloc] initWithPageName:pageName pageData:pageData];
    [controller.navigationController pushViewController:vc animated:YES];
}

- (void)closePage:(UIViewController *)controller {
    [controller.navigationController popViewControllerAnimated:YES];
}

@end
```

**KuiklyRenderComponentExpandHandler.m** — 图片加载等组件扩展，`+load` 自动注册：
```objc
+ (void)load {
    [KuiklyRenderExpandHandlerManager registerComponentExpandHandler:[self new]];
}

- (void)hr_setImageWithUrl:(NSString *)url forImageView:(UIImageView *)imageView {
    [imageView sd_setImageWithURL:[NSURL URLWithString:url]];
}
```

### 3.5 Module 层（`KuiklyExpand/Modules/`）

```objc
// HRBridgeModule.m
@implementation HRBridgeModule

- (void)toast:(NSString *)params callback:(KRModuleCallback)callback {
    // 展示 Toast
}

- (void)closePage:(NSString *)params callback:(KRModuleCallback)callback {
    [self.controller.navigationController popViewControllerAnimated:YES];
}

@end
```

### 3.6 SwiftUI 桥接

**KuiklyRenderViewPage.swift** — 将 OC VC 包装为 SwiftUI View：
```swift
struct KuiklyRenderViewPage: UIViewControllerRepresentable {
    var pageName: String
    var data: [String: Any]

    func makeUIViewController(context: Context) -> KuiklyRenderViewController {
        return KuiklyRenderViewController(pageName: pageName, pageData: data)
    }
    func updateUIViewController(_ uiViewController: KuiklyRenderViewController, context: Context) {}
}
```

**ContentView.swift** — 使用入口：
```swift
struct ContentView: View {
    var body: some View {
        KuiklyRenderViewPage(pageName: "router", data: [:])
            .ignoresSafeArea()
    }
}
```

---

## 四、鸿蒙端接入

### 4.1 Native 初始化

**napi_init.cpp** — C++ 层初始化 Kuikly：
```cpp
#include "libshared_symbols.hpp"

EXTERN_C_START
static napi_value Init(napi_env env, napi_value exports) {
    // 调用 shared 模块的 Kotlin 初始化函数
    kotlin::root::initKuikly();
    return exports;
}
EXTERN_C_END
```

**MyNativeManager.ets** — ArkTS 层 Native 管理器：
```typescript
import { KuiklyNativeManager } from '@kuikly-open/render';
import Napi from 'libentry.so';

class MyNativeManager extends KuiklyNativeManager {
    initNative(): object {
        return Napi.initKuikly();  // 调用 C++ 层
    }
}

const globalNativeManager = new MyNativeManager();
export default globalNativeManager;
```

### 4.2 Adapter 适配器（`kuikly/adapter/`）

**LogAdapter.ets：**
```typescript
import { IKRLogAdapter } from '@kuikly-open/render';
import hilog from '@ohos.hilog';

export class LogAdapter implements IKRLogAdapter {
    log(tag: string, msg: string): void {
        hilog.info(0x0000, tag, '%{public}s', msg);
    }
}
```

**RouterAdapter.ets：**
```typescript
import { IKRRouterAdapter } from '@kuikly-open/render';
import router from '@ohos.router';

export class RouterAdapter implements IKRRouterAdapter {
    openPage(pageName: string, pageData: object): void {
        router.pushUrl({ url: 'pages/Index', params: { pageName, pageData } });
    }
    closePage(): void {
        router.back();
    }
}
```

### 4.3 Module 业务模块（`kuikly/modules/`）

```typescript
// KRBridgeModule.ets
import { KuiklyRenderBaseModule, KRRenderModuleMethodCallback } from '@kuikly-open/render';

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

### 4.4 自定义 View（`kuikly/components/`，可选）

```typescript
// KRMyView.ets
import { KuiklyRenderBaseView } from '@kuikly-open/render';

export class KRMyView extends KuiklyRenderBaseView {
    static readonly VIEW_NAME = 'KRMyView';

    createArkUIView(): WrappedBuilder<[object]> {
        return wrapBuilder(MyViewBuilder);
    }

    setProp(propKey: string, propValue: string | number | boolean): boolean {
        // 处理属性设置
        return true;
    }
}
```

### 4.5 KuiklyViewDelegate（`kuikly/KuiklyViewDelegate.ets`）

注册自定义 View 和 Module：

```typescript
import { IKuiklyViewDelegate, KRRenderModuleExportCreator, KRRenderViewExportCreator } from '@kuikly-open/render';
import { KRMyView } from './components/KRMyView';
import { KRBridgeModule } from './modules/KRBridgeModule';

export class KuiklyViewDelegate extends IKuiklyViewDelegate {
    // 注册自定义 View
    getCustomRenderViewCreatorRegisterMap(): Map<string, KRRenderViewExportCreator> {
        const map = new Map<string, KRRenderViewExportCreator>();
        map.set(KRMyView.VIEW_NAME, () => new KRMyView());
        return map;
    }

    // 注册自定义 Module
    getCustomRenderModuleCreatorRegisterMap(): Map<string, KRRenderModuleExportCreator> {
        const map = new Map<string, KRRenderModuleExportCreator>();
        map.set(KRBridgeModule.MODULE_NAME, () => new KRBridgeModule());
        return map;
    }
}
```

### 4.6 EntryAbility（`entryability/EntryAbility.ets`）

在 `onWindowStageCreate` 中注册 Adapter：

```typescript
import { KuiklyRenderAdapterManager } from '@kuikly-open/render';
import { LogAdapter } from '../kuikly/adapter/LogAdapter';
import { RouterAdapter } from '../kuikly/adapter/RouterAdapter';

export default class EntryAbility extends UIAbility {
    onWindowStageCreate(windowStage: window.WindowStage): void {
        windowStage.getMainWindowSync().setWindowLayoutFullScreen(true);

        // 注册 Adapter
        KuiklyRenderAdapterManager.krLogAdapter = new LogAdapter();
        KuiklyRenderAdapterManager.krRouterAdapter = new RouterAdapter();

        windowStage.loadContent('pages/Index', ...);
    }
}
```

### 4.7 Index 页面（`pages/Index.ets`）

使用 `Kuikly` 组件渲染页面：

```typescript
import { Kuikly, KRRecord } from '@kuikly-open/render';
import router from '@ohos.router';
import { KuiklyViewDelegate } from '../kuikly/KuiklyViewDelegate';
import globalNativeManager from '../kuikly/MyNativeManager';

@Entry
@Component
struct Index {
    kuiklyViewDelegate = new KuiklyViewDelegate();
    pageName?: string;
    pageData?: KRRecord;

    aboutToAppear() {
        AppStorage.setOrCreate<UIContext>("context", this.getUIContext());
        const params = router.getParams() as Record<string, Object>;
        this.pageName = params?.pageName as string;
        this.pageData = params?.pageData as KRRecord;
    }

    build() {
        Stack() {
            Kuikly({
                pagerName: this.pageName ?? 'router',
                pagerData: this.pageData ?? {},
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

---

## 五、三端接入对比速查

| 维度 | Android | iOS | 鸿蒙 |
|---|---|---|---|
| **渲染容器** | `KuiklyRenderActivity` | `KuiklyRenderViewController` | `Kuikly` 组件 |
| **核心代理** | `KuiklyRenderViewBaseDelegator` | `KuiklyRenderViewControllerBaseDelegator` | `KuiklyViewDelegate` |
| **Adapter 注册** | `companion object { init {} }` 静态块 | `+load` 自动注册 | `EntryAbility.onWindowStageCreate` |
| **Module 注册** | `registerExternalModule()` 回调 | 自动发现（类名匹配） | `KuiklyViewDelegate.getCustomRenderModuleCreatorRegisterMap()` |
| **自定义 View 注册** | `registerExternalRenderView()` 回调 | — | `KuiklyViewDelegate.getCustomRenderViewCreatorRegisterMap()` |
| **路由跳转** | `IKRRouterAdapter` → `startActivity` | `KRRouterHandler` → `pushViewController` | `IKRRouterAdapter` → `router.pushUrl` |
| **路由关闭** | `activity.finish()` | `popViewControllerAnimated` | `router.back()` |
| **图片加载** | `IKRImageAdapter`（Glide） | `ComponentExpandHandler`（SDWebImage） | 内置处理 |
| **Native 初始化** | 自动（KMP） | 自动（KMP） | `napi_init.cpp` + `MyNativeManager` |
| **生命周期** | Activity 生命周期转发 | VC 生命周期转发 | `onPageShow` / `onPageHide` |
| **依赖引入** | `implementation(project(":shared"))` | `pod 'shared', :path => '../shared'` | `ohosApp/oh-package.json5` |

---

## 六、接入检查清单

### shared 模块
- [ ] 配置 `com.tencent.kuikly-open.kuikly` 插件
- [ ] 添加 `core`、`core-annotations`、`core-render-android` 依赖
- [ ] 配置 KSP 处理器 `core-ksp`
- [ ] 创建 `BasePager` 基类
- [ ] 创建 `BridgeModule` 桥接模块
- [ ] 用 `@Page("pageName")` 注解注册页面

### Android 端
- [ ] 创建 `KRApplication` 并在 Manifest 声明
- [ ] 实现 6 个 Adapter（Image/Log/Router/Font/Thread/UncaughtException）
- [ ] 在 `KuiklyRenderActivity.companion.init` 中注册所有 Adapter
- [ ] 创建 `KuiklyRenderActivity` 并实现 `KuiklyRenderViewBaseDelegatorDelegate`
- [ ] 在 `registerExternalModule` 中注册自定义 Module
- [ ] 在 Manifest 中声明 `KuiklyRenderActivity`

### iOS 端
- [ ] 配置 `Podfile`，添加 `OpenKuiklyIOSRender` 和 `shared`
- [ ] 创建 `KuiklyRenderViewController`，实现 `fetchContextCodeWithPageName` 返回 `@"shared"`
- [ ] 创建 `KRRouterHandler`，`+load` 中注册路由
- [ ] 创建 `KuiklyRenderComponentExpandHandler`，`+load` 中注册图片加载
- [ ] 创建 `HRBridgeModule`，实现原生能力方法
- [ ] 配置 Bridging Header 导入 OC 头文件
- [ ] 用 `UIViewControllerRepresentable` 包装 VC 供 SwiftUI 使用

### 鸿蒙端
- [ ] 配置 `CMakeLists.txt` 和 `napi_init.cpp` 初始化 Native
- [ ] 创建 `MyNativeManager` 继承 `KuiklyNativeManager`
- [ ] 实现 `LogAdapter` 和 `RouterAdapter`
- [ ] 在 `EntryAbility.onWindowStageCreate` 中注册 Adapter
- [ ] 创建 `KuiklyViewDelegate` 注册 Module 和自定义 View
- [ ] 在 `Index.ets` 中使用 `Kuikly` 组件，转发 `onPageShow`/`onPageHide`
