# samples/ —— 原始样本（**不入库**）

## 为什么这里没有 APK

| 原因 | 说明 |
|---|---|
| GitHub 硬限制 | 单文件 **100MB** 上限，样本 **219,728,776 B**，push 会被拒绝 |
| 法律 | 该样本是第三方重打包的盗版包（签名 `CN=5play.ru`），**再分发有版权风险** |
| 仓库体积 | 会让 clone 变成 200MB+，影响后续协作 |

## 如果你就在这台机器上工作（推荐做法）

样本原始位置：

```
C:\Users\zhongwen_guan\.dsh\attachments\v1\files\0f\0fa4000a45a181368047d3a19edcdd9a0181effd2eb9bfbacd7112f3287e9413\com.netflix.NGP.KatanaZero.apk
```

身份校验：

| 项 | 值 |
|---|---|
| 大小 | 219,728,776 B |
| sha256 | `0fa4000a45a181368047d3a19edcdd9a0181effd2eb9bfbacd7112f3287e9413` |

本目录里已经**放了一份副本**（219,728,776 B，与原件 sha256 一致），方便本机脚本以 `samples/com.netflix.NGP.KatanaZero.apk` 访问。

`samples/*.apk` 已写进 `.gitignore`，**不会被提交，也不会进入 GitHub**。

## 需要什么数据？

**先看 `../re/`**：房间图层、资源名全表、GML 符号、成员清单、包身份都已预解好，绝大多数情况下不需要碰这个 APK。
