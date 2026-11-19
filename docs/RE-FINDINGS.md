# 逆向结论：原作是怎么做的（用于对标，不含任何素材）

> 样本：`com.netflix.NGP.KatanaZero.apk`（219,728,776 B，sha256 `0fa4000a45a181368047d3a19edcdd9a0181effd2eb9bfbacd7112f3287e9413`）
> 方法：纯静态（未执行、未反汇编），证据均可复核。

## 1. 引擎与编译方式

| 结论 | 证据 |
|---|---|
| **GameMaker Studio 2** | 数据文件 `assets/assets/game.droid` 头为 `FORM … GEN8`；运行时 `lib/arm64-v8a/libyoyo.so`（76.5 MB） |
| **YYC 原生编译**（不是 GML 解释） | chunk 表无 CODE 块；`libyoyo.so` 的 `.text` **58,578,736 B**；`.rodata` 内含 13,375 个 `gml_*` 名字（9,304 个 `gml_Object_*` + 1,647 `gml_Script_*` + 1,380 `gml_GlobalScript_*`）；`.comment` 为 clang 18.0.2 +pgo +bolt +lto |

## 2. 代码规模（从符号名统计）

| 项 | 数量 |
|---|---|
| 对象 | 987（事件函数 9,304） |
| 事件分布 | Create 897 / Draw **748** / Step 686 / Other 358 / Destroy 53 / CleanUp 38 / Alarm 28 |
| 脚本 | 1,647（另有 1,380 全局脚本） |
| 脚本模块 | `dialogue_psych`(44)、`dialogue_girl`(44)、`dialogue_results`(36)、`dialogue_sniper`(34)、`dialogue_chinatown`(24)… **每关一套对白脚本**；`draw_sprite`(24)、`draw_text`(22)、`tile_layer`(10)、`play_sound`(9) |

> 启示：**大量小对象 + 事件驱动 + 手绘（Draw 事件多）**，而不是少数巨型状态机。

## 3. 数据（game.droid，72 MB，29 个 chunk）

| chunk | 内容 | 数量 |
|---|---|---|
| SPRT | 精灵 | 2,237 |
| BGND | 背景图块集 | 82（命名全为 `bg_*_tileset` / `bg_*_alpha`） |
| OBJT | 对象 | 1,064 |
| ROOM | 房间 | 194（92 种尺寸，最大 8000×1500） |
| SCPT / SOND / FONT / SHDR | 脚本表 / 音效 / 字体 / 着色器 | 3,591 / 883 / 11 / 7 |
| STRG | 字符串（含多语言对白） | 40,098 |
| TXTR | 纹理页 | 67（64×64 ~ 2048×2048） |
| AUDO | 音频数据 | 54,113,620 B |

## 4. 房间结构（关卡怎么搭的）

每个房间约 15 层（例：`room_prison_4`，2400×1200）：

`Assets_1`(asset) → `masters` `color_layer` `change_blocks` `block_layer` `actors` `objects` `bg_block_layer` `fog` `halogens` `blood`(instance) → `fg_tiles` `bg_tiles` `Tiles_1`(tile) → `Backgrounds_1`(background)

> 启示：**碰撞用方块实例拼**（不是 tile 自动生成）；美术走 tile 层；雾/灯光/血各自独立层按 depth 排序。这正是本项目 `covers`/`blocks`/`fx` 分层的依据。

## 5. 纹理格式（未完全解出，记录以便后人）

纹理页 = `2zoq` 头（magic 4B + 宽 u16 + 高 u16 + 解压长 u32）→ **bzip2** → `fioq` 头 + **QOI 变体**像素流。
已确认：几何/RUN 解出的横向相邻同色率 71.5%，但纵向 0.007% → **颜色增量算子与标准 QOI 不同**，尚未对齐。若需要原作 sprite（**不建议，见约束**），需先逆向该算子。

## 6. 外层（Netflix Android 壳）

- 6 个 dex、33,150 类：Netflix Games SDK `nfgsdk 1.3.1+11.38d15864`、mediaclient 登录/成就页、AndroidX/Compose、Play Core、Apollo GraphQL、OkHttp、SQLCipher
- 构建：AGP 8.5.0、msl-core 1.2231.10（CI 2023-03-03）、NDK r27b
- 混淆：R8 + 292 个字符串解密器（`char[32767]`，`seed=(seed+(seed^i)+K)%63`）→ 18,454 条字符串
- 包形态：Play AAB（`base + DynamicAssetDeliveryFiles`）+ `stamp = play.google.com/store`

## 7. 该样本已被第三方改写（不是官方包）

| 证据 | 内容 |
|---|---|
| 签名 | `CN=5play.ru` 自签名（RSA2048，2018→2048），v1/v2/v3 同一把密钥；官方签名被整体剥离 |
| 打包 | `MANIFEST.MF: Created-By: PseudoApkSigner 1.6 (AntiSplit-G2)`；1575 成员时间戳全 1980-01-01 |
| 原生层 | `libRMS.so` 被替换：`e_phentsize=17`、`.comment` 抹零、`.data` 熵 7.9985、内嵌 **5play.ru logo** 与「手指点击」手势图标 |

**本项目只借鉴其玩法结构与表现手法，不复制其任何文件。**

## 8. 未完成/局限

1. 未反汇编 ARM64（58.5 MB，`.symtab` 已 strip）→ 逻辑函数体未还原
2. QOI 变体未对齐 → 纹理页无法完整解码
3. 无官方原版 APK 基线 → 无法逐字节 diff
4. 未动态执行/抓包
