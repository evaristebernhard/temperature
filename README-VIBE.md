# 空气质量 VIBE 奖励 DApp

这是一个基于 Primus zkTLS 技术的去中心化应用，用户可以通过查询空气污染指数来获得 VIBE 代币奖励。

## 功能特性

- 🔗 **钱包连接**: 支持 MetaMask 钱包连接
- 🌐 **网络切换**: 自动切换到 Monad 测试网
- 🌫️ **空气质量查询**: 使用 Primus zkTLS SDK 安全查询空气污染数据
- 🎁 **智能奖励**: 根据污染指数自动发放 VIBE 代币
  - 空气污染指数 > 50: 获得 50 VIBE 代币
  - 空气污染指数 ≤ 50: 获得 20 VIBE 代币
- 💰 **真实代币**: VIBE 是真正的 ERC20 代币，可在 MetaMask 中查看和转账

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 部署 VIBE 代币合约（可选）

如果要部署自己的 VIBE 代币合约：

1. 创建 `.env` 文件（参考 `.env.example`）
2. 添加您的私钥：`PRIVATE_KEY=0xYOUR_PRIVATE_KEY`
3. 部署合约：
```bash
npm run compile
npm run deploy
```

### 3. 启动应用
```bash
npm run dev
```

## 使用说明

### 连接钱包
1. 点击"连接 MetaMask 钱包"
2. 应用会自动切换到 Monad 测试网
3. 点击"添加VIBE代币到MetaMask"将代币添加到钱包

### 查询空气质量并领取奖励
1. 点击"查询空气质量指数"获取上海当前空气质量
2. 系统会显示 AQI 值和对应奖励数量
3. 点击"领取 VIBE 奖励"获得代币
4. 在 MetaMask 中可以看到 VIBE 代币余额

## 技术架构

- **前端框架**: React + TypeScript + Vite
- **智能合约**: Solidity + Hardhat + OpenZeppelin
- **区块链集成**: Ethers.js v6
- **零知识证明**: Primus zkTLS SDK
- **目标网络**: Monad 测试网

## 项目结构

```
src/
├── services/
│   ├── WalletService.ts          # 钱包连接和交互
│   ├── AirPollutionService.ts    # 空气质量数据查询
│   ├── VibeTokenService.ts       # VIBE代币合约交互
│   ├── RewardService.ts          # 奖励发放逻辑
│   └── ClaimStorageService.ts    # 本地存储管理
├── config/
│   └── contract.json            # 合约配置文件
├── App.tsx                      # 主应用组件
└── main.tsx                     # 应用入口

contracts/
└── VibeToken.sol               # VIBE代币智能合约

scripts/
└── deploy.js                   # 合约部署脚本
```

## 智能合约特性

- ✅ 标准 ERC20 代币 (VIBE)
- ✅ 防重复领取机制
- ✅ 基于 AQI 的奖励计算
- ✅ 所有权管理
- ✅ 事件记录

## 网络配置

### Monad 测试网
- **Chain ID**: 10143
- **RPC URL**: `https://testnet-rpc.monad.xyz`
- **货币符号**: MON
- **区块浏览器**: `https://testnet.monadexplorer.com`

## 安全特性

- ✅ 使用 Primus zkTLS 技术确保数据真实性
- ✅ 零知识证明保护用户隐私
- ✅ 智能合约自动执行奖励逻辑
- ✅ 防止重复领取和恶意攻击
- ✅ 双重检查机制（合约+本地存储）

## 注意事项

- 需要安装 MetaMask 钱包插件
- 需要在 Monad 测试网上拥有少量 MON 代币作为 Gas 费
- 每个钱包地址只能领取一次奖励
- VIBE 代币可以在支持 ERC20 的钱包中查看和转账