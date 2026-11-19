# 刀客 · 陈霜 —— 武侠横版动作游戏原型（交接包）

这是一个**可玩、已验证**的原型：7 间房的武侠横版动作关卡，玩法取「一击必杀 + 弹反（化劲）+ 冲刺 + 死亡即重开 + 房间节拍」的类型惯例，美术与音频**全部程序化生成**，未使用任何第三方游戏素材。

## 目录

| 路径 | 内容 |
|---|---|
| `game/` | 可直接运行的源码（HTML5 Canvas，无依赖） |
| `game/www/` | Capacitor 打包用的 web 目录（内容同上） |
| `docs/AGENT-BRIEF.md` | **给下一个 Agent 的任务书（先读这个）** |
| `docs/DESIGN-SPEC.md` | 数值 / 手感 / 关卡 / 音频 / 视觉分层规范 |
| `docs/RE-FINDINGS.md` | 逆向分析结论（原作是怎么做的，可用于对标） |
| `docs/ASSET-INVENTORY.md` | 原作素材清单（仅计数与命名，**不含素材文件**） |
| `re/` | **预解好的逆向产物**（房间图层/资源名/符号/哈希），下一个 Agent 不必再碰 APK |
| `docs/PROTOTYPE-README.md` | 原型完整说明（迭代历史、调试参数、截图索引） |
| `shots/` | 实机截图 |

## 30 秒跑起来

```bash
cd game
node serve.js            # 起在 http://127.0.0.1:8123/index.html
# 另开终端
node test-headless.js    # 无头机器人自动通关验证（应输出 won:true）
```

浏览器打开 <http://127.0.0.1:8123/index.html>，**先点一下画面**解锁音频。

## 打 APK（需要 JDK 17 + Android SDK）

```bash
cd game
npm install
npx cap add android && npx cap sync android
cd android && ./gradlew assembleDebug
# 产物：android/app/build/outputs/apk/debug/app-debug.apk
```

## 底线

- **不得**把《Katana ZERO》的美术、音乐、文本、代码放进这个项目（见 `docs/ASSET-INVENTORY.md` 的说明）。
- 需要新素材时用：自绘 / CC0 素材库 / 外包。