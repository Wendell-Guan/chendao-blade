# re/ —— 预解好的逆向产物（下一个 Agent 不用再碰 APK）

> 目的：把「已经解出来的事实」全部固化，避免下一个 Agent 重复消耗 token 去解析 219MB 的 APK。
> 这里**只有**名字、计数、偏移、哈希、结构；**不含任何美术/音频/文本内容**（版权原因）。

## 为什么不放 APK 本体

1. **219,728,776 B** 超过 GitHub 单文件 100MB 硬限制，push 会被拒；
2. 该样本是第三方重打包的盗版包（签名被换成 `CN=5play.ru`），**再分发有法律风险**；
3. 这些产物已足够支撑「理解原作如何构建」，无需原文件。

> 复核身份用 `package-identity.json` 里的 sha256：`0fa4000a45a181368047d3a19edcdd9a0181effd2eb9bfbacd7112f3287e9413`。
> 想重跑：设置环境变量 `KZ_APK=<apk 路径>`，执行 `python re/tools/extract_all.py`。

## 文件清单

| 文件 | 内容 | 规模 |
|---|---|---|
| `package-identity.json` | APK 哈希/大小、6 个 dex、4 个 so、最大成员、签证明细（5play） | 2.6KB |
| `members.csv` | 1,575 个成员的 name/size/compressed/crc32/压缩方式 | 102KB |
| `game-droid-chunks.json` | game.droid 的 29 个 chunk（名称/偏移/大小）+ 完整性（chunk 表恰好覆盖到文件末尾） | 2.2KB |
| `asset-names.json` | SPRT 2237 / BGND 82 / OBJT 1064 / ROOM 194 / SCPT 3591 / SOND 883 / FONT 11 / SHDR 7 的**名字全表** | 273KB |
| `rooms.json` | 194 个房间的 名称/宽/高 + **每间房的图层表**（name/id/type/depth/visible/实例数） | 330KB |
| `gml-symbols.json` | libyoyo 里 13,375 个 `gml_*` 符号：对象→事件类型、脚本名、全局脚本名 | 197KB |
| `tools/extract_all.py` | 生成上述全部文件的脚本（依赖：python3 + cryptography） | 5KB |

## 怎么用（给下一个 Agent）

- **想知道关卡怎么搭** → 读 `rooms.json` 的 `layers`（例如 `block_layer`/`bg_block_layer` 是碰撞方块层，`fg_tiles`/`bg_tiles` 是图块层，`fog`/`halogens`/`blood` 是独立的氛围实例层）。
- **想知道代码规模/对象命名** → `gml-symbols.json`（987 个对象、每对象有哪些事件、1,647 个脚本名）。
- **想知道资源规模** → `asset-names.json` 的 count；命名习惯可直接借鉴（`bg_*_tileset`、`*_alpha`）。
- **想复核签名/是否官方包** → `package-identity.json`。
- **想复原成员级校验** → `members.csv`（size + crc32 可与任何复本比对，判断是否为同一份包）。

## 未包含（需要时会重新消耗时间，已记录原因）

| 项 | 原因 |
|---|---|
| 纹理页解码后的图像 | 版权；且格式（`2zoq` + bzip2 + QOI 变体）尚未完全对齐，参考 `../docs/RE-FINDINGS.md` 第 5 节 |
| 音频（48 个 ogg / AUDO 块） | 版权 |
| 文本（STRG 40,098 条对白） | 版权 |
| 反汇编结果 | 需要 ARM64 反汇编器（本机无 capstone/IDA） |
