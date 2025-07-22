## 技术栈

- **前端框架**: Next.js + TypeScript
- **UI 组件库**: Shadcn UI
- **智能合约**: Foundry
- **密码学库**: Primus SDK (zkTLS/zkFHE) 文档: @docs/primus.md
- **包管理器**: Bun
- **构建工具**: Vite

## 项目概述

使用 zkTLS 进行身份验证的 Token 分发系统，利用 Primus SDK 实现隐私保护的数据验证。

### 支持的区块链

- Monad Testnet

### 网络信息

#### Monad Testnet
- **网络名称**: Monad Testnet
- **Chain ID**: 10143
- **货币符号**: MON
- **区块浏览器**: https://testnet.monadexplorer.com

### 公共 RPC 锚点

| RPC URL | 提供商 | 请求限制 | 批处理调用限制 | 其他限制 |
| --- | --- | --- | --- | --- |
| https://testnet-rpc.monad.xyz | QuickNode | 25 请求/秒 | 100 | - |
| https://rpc.ankr.com/monad_testnet | Ankr | 300 请求/10 秒, 12000 请求/10 分钟 | 100 | 不允许 debug_* 方法 |
| https://rpc-testnet.monadinfra.com | Monad Foundation | 20 请求/秒 | 不允许 | 不允许 eth_getLogs 和 debug_* 方法 |

### 关键配置参数

- **空气污染指数验证模板**: `7f306580-f728-48e3-b97e-b965743c6803`