# 任务书：把「刀客 · 陈霜」从原型推进到可玩 Demo

> 交给你（下一个 Agent）的是一个**已经能玩通**的原型（7 间房、约 1300 行 JS、无依赖）。你的任务不是重写，而是在现有结构上补齐战斗深度、Boss、评级与打包。

---

## 0. 先读这里（省 token：原作数据已经解好了）

你**不需要**去找《Katana ZERO》的 APK，也不需要重新解析它。仓库里 `re/` 已经放着从样本中提取好的**全部结构性事实**：

| 你想知道 | 直接读 |
|---|---|
| 关卡是怎么搭的（15 层结构） | `re/rooms.json` → 每个房间的 `layers` |
| 代码规模与对象/事件/脚本命名 | `re/gml-symbols.json`（987 对象 / 9,304 事件 / 1,647 脚本） |
| 资源规模与命名习惯 | `re/asset-names.json`（SPRT 2237 / BGND 82 / OBJT 1064 / ROOM 194 …） |
| 包身份与签证明细 | `re/package-identity.json`（含 sha256） |
| 成员级校验 | `re/members.csv`（1,575 条的 size + crc32） |
| APK 本体 | **不在仓库**（219MB > GitHub 100MB 限制，且为盗版重打包样本）；需要时按 `re/README.md` 自行获取并用 `re/tools/extract_all.py` 复算 |

> 版权红线：`re/` 里只有名字/计数/偏移/哈希，**没有任何美术、音频、文本内容**。不要试图从 APK 里提取素材用于本项目。

---
## 1. 产品目标

做一款**武侠题材的 2D 横版动作游戏**：一击必杀、以弹反（化劲）为核心防御、房间即节拍单元、死亡即重开。手感与节奏对标《Katana ZERO》，**但美术/音频/文本必须原创**。

目标平台：移动端（PWA → APK）+ 桌面浏览器。

---

## 2. 现状（已实现，可玩）

| 模块 | 状态 | 位置 |
|---|---|---|
| 固定步长主循环（1/60） | ✅ | `game/index.html`（累加器 + 最多 6 步/帧） |
| 玩家：移动/跳/冲刺/三段连斩/化劲 | ✅ | `game/game.js` → `g.step` |
| 手感：土狼时间 0.08s / 跳缓冲 0.10s / 攻击缓冲 0.10s / 挥刀前冲 | ✅ | 同上 |
| 敌人：巡逻兵、枪手（三连发）、精英（3 血 + 0.42s 突进前摇） | ✅ | `g.step` 敌人 AI 段 |
| 掩体系统（只挡子弹） | ✅ | `LEVEL[*].covers` + 子弹碰撞 |
| 地刺 | ✅ | `LEVEL[*].spikes` |
| 特效：顿帧 / 震动 / 缩放冲击 / 暗帧 / 白闪 / 电影黑边 / 新月刀光 / 火花 / 冲击环 / 速度线 / 残影 | ✅ | `g.fx` + `decayFX` + `g.draw` |
| 音频：压缩 + 卷积混响 + 分层刀声 + 五声音阶拨弦 BGM + 雨声底噪 | ✅ | `game/audio.js`（`window.ChenDaoAudio`） |
| 剧情：房间进入对白（打字机/跳过/自动续行）+ 通关结算 + 最佳纪录 | ✅ | `g.dlg` / `say` / `advanceDlg` |
| 7 间关卡 | ✅ | `LEVEL` 数组 |
| 无头自动验证 | ✅ | `game/test-headless.js`（机器人 7 间通关） |

**当前无头验证基线**：`{ won: true, maxRoom: 7, deaths: 0, kills: 13 }`。改动后必须仍然通过。

---

## 3. 优先级（按此顺序做，每步都能玩）

### P0 —— 战斗深度（最缺）
1. **刀客（swordsman）**：贴身挥砍，前摇 0.28s；若玩家在窗口内按 `K`（`p.parryT > 0`）→ **弹反秒杀**（慢放 + 「以剑还剑」提示）；否则玩家死。
2. **盾兵（shield）**：正面免疫挥刀，必须**冲刺绕背**或**跳劈**（攻击时角色 y 是否高于敌人）；背面秒杀。
3. 两者都要接入现有 `damageEnemy` / `doKill` / `addArc` 体系，不要新写一套特效。

### P1 —— Boss（第 8 间）
- 3 阶段：突进（复用精英）→ 召唤 2 个刀客 → 8 方向弹幕环
- 血条 + 阶段切换演出（顿帧定格 + 慢放 + 名字淡入）
- 死亡：1.5s 慢动作 + 黑场 + 回到结算

### P2 —— 奖励结构
- 房间结算 S/A/B：按 无伤 / 用时 / 连斩 评分
- 连杀计数（3 秒内连续击杀累积，影响刀光亮度）
- 每间可选挑战（限时 / 无伤 / 全杀）

### P3 —— 打包与体验
- PWA：`manifest.webmanifest` + `sw.js` + 192/512 图标（Chrome 可「添加到主屏」）
- APK：Capacitor（命令见 `README.md`）
- 设置面板：音量分轨（BGM/SFX/环境）、屏幕震动强度、闪光强度
- 暂停（`Esc`）+ 全屏按钮
- Gamepad API 支持

### P4 —— 美术替换（收益最大，但需要美术资源）
- 角色 24×40：跑 6 帧 / 攻击 3 帧 / 受击 1 帧 / 死亡 3 帧
- 背景 3 层（远/中/近）960×540 透明 PNG + 1 套瓦片
- 接口约定见 `DESIGN-SPEC.md` 第 6 节

---

## 4. 代码结构

`game/game.js` 是单文件（约 1300 行），导出：

```js
window.KatanaProto = { createGame, W: 480, H: 270, DT: 1/60, LEVEL }
const g = KatanaProto.createGame();
g.input.left/right/jump/attack/parry/dash/restart = true/false
g.step();          // 推进一帧（固定 1/60）
g.draw(ctx);       // 绘制到 480×270 canvas
g.info();          // { room, deaths, kills, parries, won, combo, ... }
g.reset();         // 重开整关
g.showcase();      // 特效陈列（?fx=1 用）
```

内部结构（按出现顺序）：`LEVEL` → 调色板/像素图 `PAL/SPR` → 场景绘制 `drawMountains/drawPagoda/drawBuilding/drawBackdrop2/drawStreetProps/drawBamboo/drawLantern/drawForeground/drawGroundFx` → 音频 `makeSfx` → `createGame`（含 `resetRoom/tryMove/doAttack/damageEnemy/doKill/decayFX/g.step/g.draw`）。

**建议重构**（如果你要做大改动）：拆成 `level.js / entities.js / fx.js / render.js / audio.js / game.js`，保持暴露的 `KatanaProto` API 不变，这样现有测试与页面无需改动。

---

## 5. 已踩过的坑（别重复）

1. **跳跃高度必须 ≥44px**：`p.vy = -265`（重力 800）。低于这个值，天花板下沿的掩体会导致**关卡死锁**。
2. **掩体 `covers` 只挡子弹不挡人**：早期把柱子放进 `blocks`，柱高 82px 直接卡死玩家。
3. **对白会冻结玩法**：无头机器人必须先处理 `g.dlg.active`（按 `attack` 跳过），否则永远通关不了。
4. **不要用「读全文 → 改字符串 → 整文件写回」**的方式改这个文件：容易截断（已发生过一次）。用增量 patch。
5. **演示/测试机器人要处理断口**：只在「脚下即将无支撑」时起跳；提前 34px 起跳会掉坑。
6. **闪光/震动强度**已偏高，做设置项时把默认值调低 20%。

---

## 6. 验收标准（请逐条自测）

- [ ] `node game/test-headless.js` 输出 `won: true` 且 `errors: []`
- [ ] 新增敌人后，机器人**不会**在任意房间卡死（`maxRoom` 必须到 7 或到新 Boss 房）
- [ ] 任一房间内，玩家不操作时的**空闲帧数**不导致状态错乱（对白/结算能正常推进）
- [ ] 帧率：桌面 Chrome 稳定 60fps；移动端 DevTools 4× CPU 降速下 ≥40fps
- [ ] 音频：首次点击后 BGM + 雨声 + 刀声/命中/化劲/死亡均可闻，无爆音
- [ ] 打包：`./gradlew assembleDebug` 成功，APK 在 Android 11+ 真机可安装启动
- [ ] 不引入任何第三方游戏素材（见 `ASSET-INVENTORY.md`）

---

## 7. 硬约束

- **禁止**把《Katana ZERO》的美术、音乐、文本、GML 代码或其反编译产物放入本仓库。
- 参考其**机制与结构**是允许的（玩法不受版权保护），但**不要复制表达**。
- 新素材来源：自绘 / CC0 素材库（如 Kenney、itch.io 免费区）/ 外包，并在 `CREDITS.md` 记录来源与许可。

---

## 8. 参考资料

- 原作技术结构分析：`docs/RE-FINDINGS.md`（GameMaker + YYC 原生编译、房间 15 层结构、纹理格式等）
- 原型完整说明与调参表：`docs/PROTOTYPE-README.md`
- 设计参数：`docs/DESIGN-SPEC.md`
