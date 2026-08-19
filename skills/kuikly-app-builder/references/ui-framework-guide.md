# 📖 UI Framework 开发指南

## 框架概述

Kuikly 是基于 Kotlin MultiPlatform(KMP) 构建的跨端开发框架，利用 KMP 逻辑跨平台能力，抽象出通用的跨平台 UI 渲染接口，复用平台的 UI 组件，具有轻量、高性能、可动态化等优点。

## 参考资源结构

`references/` 目录包含：

### 官方文档 (`references/KuiklyUI/docs/`)
- **API 组件文档**: `docs/API/components/`
- **API 模块文档**: `docs/API/modules/`
- **开发指南**: `docs/DevGuide/`
- **快速开始**: `docs/QuickStart/`
- **Compose DSL**: `docs/ComposeDSL/`
- **常见问题**: `docs/QA/`

### 框架源码 (`references/KuiklyUI/`)
- **核心模块**: `core/src/commonMain/kotlin/com/tencent/kuikly/core/base/` (Attr.kt, Color.kt, Animation.kt, ViewContainer.kt)
- **Compose 模块**: `compose/src/commonMain/kotlin/`
- **Demo 示例**: `demo/src/commonMain/kotlin/`
- **平台实现**: `core-render-android/`, `core-render-ios/`, `core-render-ohos/`, `core-render-web/`

## 最高优先级规则：禁止凭记忆写代码

1. **禁止凭记忆回答** — 所有 API 信息必须来自 `references/` 目录下的文档和源码
2. **强制查阅流程** — 收到请求后，第一步必须使用工具查阅相关资源，第二步才能提供代码
3. **严格复制文档语法** — 不要用其他框架(JS/Android/iOS)的语法替代 Kuikly 的语法
4. **引用来源** — 在回复中必须引用文档/源码路径
5. **组件/模块不存在时** — 引导用户使用自定义扩展（`expand-native-ui.md` 或 `expand-native-api.md`），不要简单说"不支持"


## 查阅策略

**Step 1 — 查阅官方文档** (必须)
```
使用 read_file 读取 references/KuiklyUI/docs/ 下的相关文档:
- 组件 API: references/KuiklyUI/docs/API/components/{组件名}.md
- 模块 API: references/KuiklyUI/docs/API/modules/{模块名}.md
- 开发指南: references/KuiklyUI/docs/DevGuide/{主题}.md
- 基础属性（必读）: references/KuiklyUI/docs/API/components/basic-attr-event.md
- 查询公有类 : references/component-api/components/all-public-classes.md"
```

**Step 2 — 查阅源码及Demo实现** (必须)
```
- 核心类: references/KuiklyUI/core/src/commonMain/kotlin/com/tencent/kuikly/core/base/
- 搜索组件: search_content(pattern="class Button", directory="references/KuiklyUI/core/src")
- Demo 示例: search_file(pattern="*Page.kt", directory="references/KuiklyUI/demo/src")
```

**Step 3 — 验证 API 存在性**
- 确认代码中的每个 API 都在文档或源码中存在
- 如果文档和源码中都没有找到，明确告诉用户并引导使用自定义扩展

## 代码编写规则

1. 每个 API 必须能在文档或源码中找到对应说明
2. 在回复中**必须引用资源路径**
3. 不要编造不存在的属性名、方法或事件名
4. `basic-attr-event.md` 中是所有组件都拥有的基础属性和事件
5. 文档中的示例变量有时是伪代码（如 `size(screenWidth, screenHeight)`，需自己获取值）
6. 不要用其他框架的语法替代 Kuikly 语法

## 开发模式

### Compose DSL
本 skill 统一使用 Compose DSL 语法，覆盖 Android/iOS/鸿蒙/H5/微信小程序：

```kotlin
@Composable
fun MyScreen() {
    Column(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = "Hello Kuikly", fontSize = 20.sp, color = Color.Blue)
        Button(onClick = { /* 处理点击 */ }) { Text("点击我") }
    }
}
```

## 布局系统

Kuikly 使用 **FlexBox 布局**作为跨平台布局规则。

**核心布局属性：**
- `flexDirection`：主轴方向（COLUMN/ROW/COLUMN_REVERSE/ROW_REVERSE）
- `justifyContent`：主轴对齐（FLEX_START/CENTER/FLEX_END/SPACE_BETWEEN/SPACE_AROUND/SPACE_EVENLY）
- `alignItems`：交叉轴对齐（FLEX_START/CENTER/FLEX_END/STRETCH）
- `flexWrap`：是否换行（NOWRAP/WRAP）

## UI Framework 文档索引

### UI 组件文档
| 组件 | 文档路径 |
|------|---------|
| View（容器） | `references/KuiklyUI/docs/API/components/view.md` |
| Text（文本） | `references/KuiklyUI/docs/API/components/text.md` |
| List（列表） | `references/KuiklyUI/docs/API/components/list.md` |
| Scroller（滚动容器） | `references/KuiklyUI/docs/API/components/scroller.md` |
| Input（输入框） | `references/KuiklyUI/docs/API/components/input.md` |
| TextArea（多行输入） | `references/KuiklyUI/docs/API/components/text-area.md` |
| Button（按钮） | `references/KuiklyUI/docs/API/components/button.md` |
| Image（图片） | `references/KuiklyUI/docs/API/components/image.md` |
| Modal（弹窗） | `references/KuiklyUI/docs/API/components/modal.md` |
| AlertDialog（警告对话框） | `references/KuiklyUI/docs/API/components/alert-dialog.md` |
| ActionSheet（底部菜单） | `references/KuiklyUI/docs/API/components/action-sheet.md` |
| Tabs（标签页，需搭配 PageList 使用） | `references/KuiklyUI/docs/API/components/tabs.md` |
| Video（视频） | `references/KuiklyUI/docs/API/components/video.md` |
| Canvas（画布） | `references/KuiklyUI/docs/API/components/canvas.md` |
| Refresh（下拉刷新） | `references/KuiklyUI/docs/API/components/refresh.md` |
| Blur（模糊效果） | `references/KuiklyUI/docs/API/components/blur.md` |
| RichText（富文本） | `references/KuiklyUI/docs/API/components/rich-text.md` |

### 系统模块文档
| 模块 | 文档路径 |
|------|---------|
| RouterModule（路由） | `references/KuiklyUI/docs/API/modules/router.md` |
| NetworkModule（网络） | `references/KuiklyUI/docs/API/modules/network.md` |
| SharedPreferencesModule（存储） | `references/KuiklyUI/docs/API/modules/sp.md` |
| NotifyModule（通知） | `references/KuiklyUI/docs/API/modules/notify.md` |
| MemoryCacheModule（缓存） | `references/KuiklyUI/docs/API/modules/memory-cache.md` |
| SnapshotModule（截图） | `references/KuiklyUI/docs/API/modules/snapshot.md` |
| CodecModule（编解码） | `references/KuiklyUI/docs/API/modules/codec.md` |
| CalendarModule（日历） | `references/KuiklyUI/docs/API/modules/calendar.md` |
| PerformanceModule（性能） | `references/KuiklyUI/docs/API/modules/performance.md` |

### 开发指南文档
| 主题 | 文档路径 |
|------|---------|
| FlexBox 布局 | `references/KuiklyUI/docs/DevGuide/flexbox-basic.md` |
| FlexBox 实战 | `references/KuiklyUI/docs/DevGuide/flexbox-in-action.md` |
| 响应式更新 | `references/KuiklyUI/docs/DevGuide/reactive-update.md` |
| 指令系统 (vif/vfor) | `references/KuiklyUI/docs/DevGuide/directive.md` |
| 动画基础 | `references/KuiklyUI/docs/DevGuide/animation-basic.md` |
| 声明式动画 | `references/KuiklyUI/docs/DevGuide/animation-declarative.md` |
| 命令式动画 | `references/KuiklyUI/docs/DevGuide/animation-imperative.md` |
| 多页面开发 | `references/KuiklyUI/docs/DevGuide/multi-page.md` |
| 打开和关闭页面 | `references/KuiklyUI/docs/DevGuide/open-and-close-page.md` |
| 页面数据传递 | `references/KuiklyUI/docs/DevGuide/page-data.md` |
| 网络请求 | `references/KuiklyUI/docs/DevGuide/network.md` |
| 线程与协程 | `references/KuiklyUI/docs/DevGuide/thread-and-coroutines.md` |
| 定时器 | `references/KuiklyUI/docs/DevGuide/set-timeout.md` |
| 资源管理 | `references/KuiklyUI/docs/DevGuide/assets-resource.md` |
| 扩展原生 API | `references/KuiklyUI/docs/DevGuide/expand-native-api.md` |
| 扩展原生 UI | `references/KuiklyUI/docs/DevGuide/expand-native-ui.md` |
| Compose DSL 概述 | `references/KuiklyUI/docs/ComposeDSL/overview.md` |
| Compose API 列表 | `references/KuiklyUI/docs/ComposeDSL/allApi.md` |

### 常见任务快速索引

| 任务 | 参考文档 |
|------|---------|
| 创建页面 | `docs/DevGuide/multi-page.md` |
| FlexBox 布局 | `docs/DevGuide/flexbox-basic.md` |
| 列表滚动 | `docs/API/components/list.md` |
| 网络请求 | `docs/API/modules/network.md` |
| 页面跳转 | `docs/API/modules/router.md` |
| 响应式状态 | `docs/DevGuide/reactive-update.md` |
| 条件渲染 | `docs/DevGuide/directive.md` (vif) |
| 列表循环 | `docs/DevGuide/directive.md` (vfor) |
| 动画效果 | `docs/DevGuide/animation-basic.md` |
| 本地存储 | `docs/API/modules/sp.md` |
| 自定义组件 | `docs/DevGuide/expand-native-ui.md` |
| 自定义模块 | `docs/DevGuide/expand-native-api.md` |

## 处理不存在的组件/模块

**当文档和源码中都找不到用户需要的组件或模块时，不要简单说"不支持"，而应该：**

- **组件不存在** → 引导查阅 `references/KuiklyUI/docs/DevGuide/expand-native-ui.md` 实现自定义组件
- **模块/功能不存在** → 引导查阅 `references/KuiklyUI/docs/DevGuide/expand-native-api.md` 实现自定义模块
- **属性不存在但组件存在** → 检查 `base-properties-events.md` 通用属性，或建议通过扩展实现

## Compose DSL 速查

Kuikly 同时支持 Compose DSL 语法，覆盖 Android/iOS/鸿蒙/H5/微信小程序。

### Compose DSL 包名规则

Compose DSL 的 import **不使用** `androidx.compose.*`，而是使用 Kuikly 自己的包名：

| 类别 | Kuikly Compose 包名 |
|------|---------------------|
| UI 基础 | `com.tencent.kuikly.compose.ui.*` |
| Foundation | `com.tencent.kuikly.compose.foundation.*` |
| Material3 | `com.tencent.kuikly.compose.material3.*` |
| 动画 | `com.tencent.kuikly.compose.animation.*` |
| Runtime | `androidx.compose.runtime.*` (例外，保持原包名) |

### Compose DSL 文档与源码

| 资源 | 路径 |
|------|------|
| 核心组件 | `references/KuiklyUI/docs/Compose/core-components.md` |
| 布局系统 | `references/KuiklyUI/docs/Compose/layout.md` |
| 列表滚动 | `references/KuiklyUI/docs/Compose/list-and-scroll.md` |
| Modifier | `references/KuiklyUI/docs/Compose/modifier.md` |
| 动画系统 | `references/KuiklyUI/docs/Compose/animation-system.md` |
| 手势系统 | `references/KuiklyUI/docs/Compose/gesture-system.md` |
| 状态管理 | `references/KuiklyUI/docs/Compose/status-management.md` |
| 导航 | `references/KuiklyUI/docs/Compose/navigation.md` |
| ViewModel | `references/KuiklyUI/docs/Compose/view-model.md` |
| 常见问题 | `references/KuiklyUI/docs/Compose/faq.md` |
| 能力全览 | `references/KuiklyUI/docs/Compose/status.md` |
| Compose 源码 | `references/KuiklyUI/compose/src/commonMain/kotlin/com/tencent/kuikly/compose/` |
| Demo 示例 | `references/KuiklyUI/demo/src/commonMain/kotlin/com/tencent/kuikly/demo/pages/compose/` |