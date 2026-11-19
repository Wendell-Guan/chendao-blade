# 原作素材清单（仅命名与计数，**不含任何素材文件**）

> 目的：让后续 Agent 知道原作规模与命名习惯，用于**自行设计**同量级的资源结构。
> 本文件**不包含**任何美术/音频/文本资源，也不包含 APK 本体。

## 1. 规模

| 类型 | 数量 | 说明 |
|---|---|---|
| 精灵 SPRT | 2,237 | 角色/敌人/道具/背景元素 |
| 背景图块集 BGND | 82 | 全部为 `*_tileset` 或 `*_alpha` 变体 |
| 对象 OBJT | 1,064 | 行为逻辑载体 |
| 房间 ROOM | 194 | 92 种尺寸，最大 8000×1500 |
| 脚本 SCPT | 3,591 | 含 `gml_Script_*` 副本 |
| 音效 SOND | 883 | 含 `song_*`（场景曲）与 `buffer_sfx` |
| 字体 FONT | 11 | — |
| 着色器 SHDR | 7 | — |
| 字符串 STRG | 40,098 | 含多语言对白 |
| 纹理页 TXTR | 67 | 64×64 ~ 2048×2048 |
| 音频数据 | 54,113,620 B | — |
| 独立 .ogg | 48 | 明文，可直接播放（本项目未使用） |

## 2. 命名习惯（抽样）

| 类别 | 样例 |
|---|---|
| 背景/图块 | `bg_apt_hallway_tileset`、`bg_bunker_background_tileset`、`bg_bunker_foreground_tileset`、`bg_blackfade` |
| 精灵 | `bg_apt_hallway_alpha`、`bg_bar`、`bg_bar_alpha` |
| 对象 | `obj_actor`、`obj_AI`、`obj_ai_target`、`obj_aidoor`、`obj_alarm_light`、`obj_bullet`、`obj_textbox` |
| 房间 | `room_title`、`room_logo`、`room_prison_4`、`room_haunted_cart1` |
| 脚本 | `dialogue_chinatown`、`dialogue_psych`、`draw_sprite`、`draw_text`、`tile_layer`、`play_sound` |
| 音乐 | `song_bunker_1`、`song_cathedral`、`song_chinatown`、`song_bossbattle` |

## 3. 原作的图层命名（可直接借鉴的结构，不是素材）

`Assets_1` / `masters` / `color_layer` / `change_blocks` / `block_layer` / `actors` / `objects` / `bg_block_layer` / `fog` / `halogens` / `blood` / `fg_tiles` / `bg_tiles` / `Tiles_1` / `Backgrounds_1`

> 借鉴这套**分层思路**是允许的；把这些名字对应的美术文件拿过来用是**不允许**的。

---

## ⚠️ 版权与使用边界

1. 《Katana ZERO》的美术、音乐、对白、GML 代码版权归 **Askiisoft / Netflix**。**不得**提取、改造、再分发。
2. 本仓库中的原型是**原创实现**：所有图形由代码绘制（`drawPlayerBig` 等）、音频由 WebAudio 实时合成（`audio.js`）、文本为本项目原创。
3. 若后续需要素材，请使用：自绘 / CC0 素材库 / 外包，并在 `CREDITS.md` 记录来源与许可。
4. 本文件只提供**计数与命名**，用于规模与结构参考，不构成任何素材授权。
