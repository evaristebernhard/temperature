# 🌫️ 空气质量 VIBE 代币奖励 DApp

一个基于 Primus zkTLS 零知识证明技术的去中心化应用，用户可以通过查询真实空气质量数据获得 VIBE 代币奖励。

![VIBE Token](https://img.shields.io/badge/Token-VIBE%20ERC20-green) ![Network](https://img.shields.io/badge/Network-Monad%20Testnet-blue) ![zkTLS](https://img.shields.io/badge/Tech-Primus%20zkTLS-purple)

## ✨ 核心功能

### 🎯 主要特性
- **🔐 零知识证明验证**：使用 Primus zkTLS 技术安全验证空气质量数据
- **💰 真实 ERC20 代币**：VIBE 是标准 ERC20 代币，可在 MetaMask 中显示和转账
- **🌍 实时数据查询**：获取上海实时空气质量指数（AQI）
- **🎁 智能奖励机制**：
  - 空气污染指数 > 50：获得 **50 VIBE** 代币
  - 空气污染指数 ≤ 50：获得 **20 VIBE** 代币
- **🛡️ 防重复领取**：每个钱包地址只能领取一次奖励
- **🌐 多链支持**：部署在 Monad 测试网上

### 🔧 技术栈
- **前端**：React + TypeScript + Vite
- **智能合约**：Solidity + OpenZeppelin + Hardhat
- **区块链交互**：Ethers.js v6
- **零知识证明**：Primus zkTLS SDK
- **目标区块链**：Monad Testnet

## 🚀 快速开始

### 📋 前置条件

1. **安装 Node.js**：版本 18 或更高
2. **安装 MetaMask**：浏览器钱包插件
3. **获得测试代币**：在 Monad 测试网上需要少量 MON 代币作为 Gas 费

### 💻 本地开发

#### 1. 克隆项目
```bash
git clone <repository-url>
cd air-pollution-vibe-dapp
```

#### 2. 安装依赖
```bash
npm install
```

#### 3. 配置环境变量（可选 - 仅部署合约时需要）
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，添加您的私钥
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

#### 4. 启动开发服务器
```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动

> **注意**：如果没有部署VIBE代币合约，应用会自动进入模拟模式，所有代币操作将被模拟执行。

### 🔨 智能合约部署（可选）

如果您想部署自己的 VIBE 代币合约：

#### 1. 编译合约
```bash
npm run compile
```

#### 2. 部署到 Monad 测试网
```bash
npm run deploy
```

部署成功后，合约地址会自动保存到 `src/config/contract.json`

## 📱 使用指南

### 第一步：连接钱包
1. 打开应用后点击 **"连接 MetaMask 钱包"**
2. 系统会自动检测网络并提示切换到 Monad 测试网
3. 确认网络切换并连接钱包

### 第二步：添加 VIBE 代币
1. 连接钱包后，点击 **"添加VIBE代币到MetaMask"**
2. 如果合约已部署，MetaMask 会弹出添加代币的确认窗口
3. 如果合约未部署，按钮会显示"合约未部署，无法添加"

> **模拟模式说明**：如果VIBE代币合约未部署，应用会显示"🧪 模拟模式"提示，此时代币奖励为演示性质，不会产生真实的区块链交易。

#### 🔍 在 MetaMask 中查找 VIBE 代币

**方法一：自动添加（推荐）**
- 在应用中点击 **"添加VIBE代币到MetaMask"** 按钮
- MetaMask 会自动弹出添加代币的窗口
- 点击 **"添加代币"** 确认

**方法二：手动添加**
如果自动添加失败，可以手动添加：

1. 打开 MetaMask 钱包
2. 在主界面向下滚动，找到 **"导入代币"** 或 **"Import tokens"**
3. 点击 **"自定义代币"** 标签
4. 输入以下信息：
   - **代币合约地址**：`0x0000000000000000000000000000000000000000`（需要部署后替换）
   - **代币符号**：`VIBE`
   - **小数位数**：`18`
5. 点击 **"添加自定义代币"**
6. 确认添加

**查看 VIBE 代币余额**
- 添加成功后，VIBE 代币会出现在 MetaMask 主界面的代币列表中
- 显示位置：ETH 余额下方的代币列表
- 点击 VIBE 代币可以查看详细信息和交易记录

![MetaMask VIBE Token](https://img.shields.io/badge/MetaMask-VIBE%20Token-orange)

### 第三步：查询空气质量
1. 点击 **"查询空气质量指数"**
2. 系统使用 zkTLS 技术获取上海实时空气质量数据
3. 显示当前 AQI 值和空气质量等级

### 第四步：领取奖励
1. 查看根据 AQI 计算的奖励数量预览
2. 点击 **"领取 VIBE 奖励"**
3. 确认交易并等待区块确认
4. 在 MetaMask 中查看您的 VIBE 代币余额

## 🏗️ 项目架构

```
air-pollution-vibe-dapp/
├── src/
│   ├── services/              # 核心服务层
│   │   ├── WalletService.ts          # 钱包连接管理
│   │   ├── AirPollutionService.ts    # 空气质量数据查询
│   │   ├── VibeTokenService.ts       # VIBE代币合约交互
│   │   ├── RewardService.ts          # 奖励发放业务逻辑
│   │   └── ClaimStorageService.ts    # 本地存储管理
│   ├── config/
│   │   └── contract.json      # 智能合约配置
│   ├── App.tsx               # 主应用组件
│   ├── main.tsx             # 应用入口
│   └── index.css           # 全局样式
├── contracts/
│   └── VibeToken.sol       # VIBE代币智能合约
├── scripts/
│   └── deploy.js          # 合约部署脚本
├── hardhat.config.js     # Hardhat配置
└── package.json         # 项目依赖
```

## 🔒 智能合约详情

### VIBE Token 合约特性
- **标准 ERC20 实现**：兼容所有 ERC20 钱包和交易所
- **防重复领取**：合约级别的地址检查机制
- **事件记录**：完整的链上操作日志
- **所有权管理**：支持合约管理和维护
- **安全审计**：基于 OpenZeppelin 安全库

### 主要函数
```solidity
// 领取代币（用户调用）
function claimTokens(uint256 aqi) external

// 检查领取状态（查询用）
function checkClaimStatus(address user) external view 
    returns (bool claimed, uint256 timestamp, uint256 amount)
```

## 🌐 网络配置

### Monad 测试网详情
- **网络名称**：Monad Testnet
- **Chain ID**：10143 (0x279F)
- **RPC URL**：`https://testnet-rpc.monad.xyz`
- **货币符号**：MON
- **区块浏览器**：`https://testnet.monadexplorer.com`

### 添加网络到 MetaMask
应用会自动提示并帮助您添加 Monad 测试网配置。

## 🔐 安全特性

- ✅ **零知识证明数据验证**：使用 Primus zkTLS 确保数据真实性
- ✅ **隐私保护**：零知识证明技术保护用户隐私
- ✅ **智能合约安全**：基于 OpenZeppelin 安全标准
- ✅ **防重复领取**：合约和前端双重检查机制
- ✅ **交易透明**：所有操作可在区块浏览器查询

## 🎯 奖励规则

| 空气质量指数 (AQI) | 空气质量等级 | VIBE 奖励数量 | 说明 |
|-------------------|-------------|--------------|------|
| 0-50              | 优          | 20 VIBE      | 空气质量令人满意 |
| 51-100            | 良          | 50 VIBE      | 空气质量可接受 |
| 101+              | 轻度污染以上  | 50 VIBE      | 需要注意防护 |

> **注意**：每个钱包地址只能领取一次奖励

## 💰 VIBE 代币使用指南

### 📍 在 MetaMask 中查找 VIBE 代币

**代币信息：**
- **代币名称**：VIBE Token
- **代币符号**：VIBE
- **代币类型**：ERC20
- **小数位数**：18
- **网络**：Monad Testnet

**代币位置：**
1. 打开 MetaMask 钱包
2. 确保当前网络为 **Monad Testnet**
3. 在主界面可以看到：
   ```
   账户 1
   0.1234 MON                    ← 原生代币余额
   
   资产 ▼
   Ethereum        0 ETH
   VIBE Token      50 VIBE       ← VIBE代币显示在这里
   ```

### 🔄 VIBE 代币常用操作

**1. 查看余额和交易记录**
- 点击 VIBE Token → 查看详细余额
- 点击 **"活动"** → 查看所有VIBE相关交易
- 点击具体交易 → 查看交易详情（发送方、接收方、数量、时间）

**2. 发送 VIBE 给其他人**
- 点击 VIBE Token
- 点击 **"发送"** 按钮
- 输入接收方地址（必须是有效的以太坊地址）
- 输入发送数量（如：10 VIBE）
- 点击 **"下一步"** → 确认交易 → 支付 Gas 费

**3. 接收 VIBE 代币**
- 点击 **"接收"** 获取您的钱包地址
- 将地址分享给发送方
- 等待交易确认（通常1-2分钟）

**4. 在区块链浏览器查看**
- 复制钱包地址
- 访问：`https://testnet.monadexplorer.com`
- 粘贴地址并搜索
- 查看所有VIBE代币交易历史

### 🎯 VIBE 代币价值和用途

**当前用途：**
- ✅ **收藏价值**：作为参与空气质量验证的纪念
- ✅ **转账功能**：可以自由转账给其他钱包地址  
- ✅ **技术展示**：展示零知识证明技术的应用

**未来可能用途：**
- 🔮 **生态治理**：参与相关DAO治理投票
- 🔮 **质押奖励**：质押获得额外收益
- 🔮 **NFT铸造**：使用VIBE铸造环保主题NFT
- 🔮 **碳积分兑换**：兑换其他环保代币或积分

### ⚠️ 重要提醒

- **保管好私钥**：VIBE是真实的区块链代币，私钥丢失将无法找回
- **网络费用**：转账VIBE需要支付MON代币作为Gas费
- **网络确认**：确保在Monad Testnet网络操作
- **诈骗防范**：永远不要将私钥或助记词告诉他人

## 🛠️ 开发命令

```bash
# 开发环境
npm run dev              # 启动开发服务器
npm run build           # 构建生产版本
npm run preview         # 预览构建结果

# 智能合约
npm run compile         # 编译合约
npm run deploy          # 部署合约到测试网

# 其他
npm install             # 安装依赖
npm audit               # 安全审计
```

## 🐛 故障排除

### 常见问题

**1. MetaMask 连接失败**
- 确保已安装 MetaMask 浏览器插件
- 检查是否允许网站访问钱包

**2. 网络切换失败**
- 手动添加 Monad 测试网配置
- 确保网络参数正确

**3. VIBE代币不显示或余额为0**

*情况A：代币未添加到钱包*
- 点击应用中的 **"添加VIBE代币到MetaMask"** 按钮
- 或手动添加：MetaMask → 导入代币 → 自定义代币
- 输入合约地址、符号(VIBE)、小数位数(18)

*情况B：代币已添加但余额为0*
- 确认已成功领取奖励（检查交易记录）
- 在区块浏览器查询交易状态：`https://testnet.monadexplorer.com`
- 刷新 MetaMask 或切换网络后再切回
- 等待几分钟让区块链同步

*情况C：代币显示但无法转账*
- 确保在正确的网络（Monad Testnet）
- 检查钱包中是否有足够的 MON 代币支付 Gas 费
- 验证接收地址是否正确

**4. 如何查看VIBE代币交易记录**
- 在 MetaMask 中点击 VIBE 代币
- 查看 **"活动"** 标签下的交易历史
- 点击具体交易可查看详细信息
- 或在 Monad 区块浏览器中输入交易哈希查询

**5. 如何转账VIBE代币给其他人**
- 在 MetaMask 中选择 VIBE 代币
- 点击 **"发送"** 按钮
- 输入接收方钱包地址
- 输入转账数量
- 确认交易并支付 Gas 费

**6. 交易失败**
- 确保钱包有足够的 MON 代币支付 Gas 费
- 检查网络连接状态

**7. 如何清除本地交易记录（测试功能）**

⚠️ **重要说明**：清除记录功能仅用于测试和开发，只会清除本地浏览器存储的记录，不会影响区块链上的实际交易。

**清除当前用户记录：**
- 在已领取奖励后，领取记录下方会显示 **"清除本地记录 (测试用)"** 红色按钮
- 点击按钮并确认，将清除当前钱包地址的本地记录
- 清除后可以重新领取奖励（仅用于测试目的）

**清除所有用户记录（管理员功能）：**
- 在奖励部分底部的"🔧 测试功能"区域
- 点击 **"清除所有本地记录 (管理员)"** 灰色按钮
- 确认后将清除所有用户的本地记录

**注意事项：**
- ⚠️ 此功能仅影响本地浏览器存储的记录
- ⚠️ 区块链上的实际交易和智能合约状态不会受到影响
- ⚠️ 其他浏览器或设备上的记录不会被清除
- ⚠️ 智能合约仍会阻止同一地址重复领取（如果合约已部署）

**8. 空气质量数据获取失败**
- 检查网络连接
- Primus zkTLS 服务可能暂时不可用

### 获取帮助
- 📧 提交 Issue 到项目仓库
- 🌐 访问 [Primus 社区](https://discord.gg/AYGSqCkZTz)

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目仓库
2. 创建功能分支：`git checkout -b feature/new-feature`
3. 提交更改：`git commit -m 'Add new feature'`
4. 推送分支：`git push origin feature/new-feature`
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔗 相关链接

- 🌐 **Primus Labs**：[https://primuslabs.xyz](https://primuslabs.xyz)
- 📚 **Primus 开发者文档**：[https://dev.primuslabs.xyz](https://dev.primuslabs.xyz)
- 🔗 **Monad 区块链**：[https://www.monad.xyz](https://www.monad.xyz)
- 💬 **Primus Discord**：[https://discord.gg/AYGSqCkZTz](https://discord.gg/AYGSqCkZTz)

## ⭐ 支持项目

如果这个项目对您有帮助，请给我们一个 ⭐ Star！

---

*构建于 2024 年，使用 ❤️ 和最新的 Web3 技术栈*