# 模拟器实测记录（2026-11-20）

## 环境

| 项 | 值 |
|---|---|
| 模拟器 | MuMu 模拟器（`D:\Program Files\Netease\MuMu`） |
| 实例 | 0 号，**Android 15.0** |
| 虚拟化 | Hyper-V 已启用（`hyperv_enabled: true`） |
| 管理工具 | `nx_main\MuMuManager.exe` |
| adb | 端口 16384（adb server 在受限环境下不可用，改用 MuMuManager 的 API） |

## 安装与启动

```powershell
$mm = "D:\Program Files\Netease\MuMu\nx_main\MuMuManager.exe"
& $mm control -v 0 app install --apk <样本APK绝对路径>
# => { "package": "com.netflix.NGP.KatanaZero" }   (exit 0, 8.2s)

& $mm control -v 0 app launch --package com.netflix.NGP.KatanaZero
# => { "errcode": 0 }   然后 state: running
```

## 结果

- **安装成功**（Android 15 严格校验 v1/v2/v3 通过）→ 推翻“v2/v3 伪签名导致装不上”的早期判断
- **启动成功**，进入标题菜单：`新游戏 / 继续 / 选项 / 语言 - 简体中文`，右下角 `v1.1.10`
- **没有 Netflix 登录页** → 重打包方绕过了官方认证门

## 截图

截图存在**本机**（不入库，避免二次分发他人游戏画面）：

```
C:\Users\zhongwen_guan\Documents\MuMu共享文件夹\Screenshots\MuMu-20261120-131417-931.png
```

触发方式：`& $mm control -v 0 tool func --name screenshot`

## 对项目的意义

1. `re/` 里的结构数据可信度提高（说明样本是完整可运行的官方构建 + 认证剥离）。
2. 「5play 只换签名」的假设不成立：**认证逻辑被改过**（与 `libRMS.so` 被替换一致）。
3. 项目**仍然不允许**使用其素材；本记录只用于理解结构。