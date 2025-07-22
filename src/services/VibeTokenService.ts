import { ethers } from 'ethers'
import contractConfig from '../config/contract.json'

export interface TokenInfo {
  balance: string
  name: string
  symbol: string
  decimals: number
}

export class VibeTokenService {
  private contract: ethers.Contract | null = null
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.JsonRpcSigner | null = null

  constructor(provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) {
    this.provider = provider
    this.signer = signer
    
    // 检查合约地址是否有效
    if (contractConfig.contractAddress === '0x0000000000000000000000000000000000000000') {
      console.warn('VIBE代币合约未部署，使用模拟模式')
      this.contract = null
    } else {
      this.contract = new ethers.Contract(
        contractConfig.contractAddress,
        contractConfig.abi,
        signer
      )
    }
  }

  async claimTokens(aqi: number): Promise<string> {
    if (!this.contract) {
      // 模拟模式：生成假的交易哈希
      console.log('模拟模式：生成VIBE代币奖励')
      const amount = aqi > 50 ? 50 : 20
      await new Promise(resolve => setTimeout(resolve, 2000)) // 模拟交易延迟
      return '0x' + Math.random().toString(16).substr(2, 64).padStart(64, '0')
    }

    try {
      const tx = await this.contract.claimTokens(aqi)
      await tx.wait()
      return tx.hash
    } catch (error: any) {
      if (error.message.includes('already claimed')) {
        throw new Error('该地址已经领取过代币')
      }
      throw new Error(`领取失败: ${error.message}`)
    }
  }

  async checkClaimStatus(address: string): Promise<{claimed: boolean, timestamp: number, amount: string}> {
    if (!this.contract) {
      // 模拟模式：返回默认状态
      return {
        claimed: false,
        timestamp: 0,
        amount: '0'
      }
    }

    try {
      const [claimed, timestamp, amount] = await this.contract.checkClaimStatus(address)
      return {
        claimed,
        timestamp: Number(timestamp),
        amount: ethers.formatEther(amount)
      }
    } catch (error: any) {
      throw new Error(`检查状态失败: ${error.message}`)
    }
  }

  async getTokenBalance(address: string): Promise<string> {
    if (!this.contract) {
      // 模拟模式：返回模拟余额
      return '0'
    }

    try {
      const balance = await this.contract.balanceOf(address)
      return ethers.formatEther(balance)
    } catch (error: any) {
      throw new Error(`获取余额失败: ${error.message}`)
    }
  }

  async getTokenInfo(): Promise<TokenInfo> {
    if (!this.contract) {
      // 模拟模式：返回默认代币信息
      return {
        name: 'VIBE Token (未部署)',
        symbol: 'VIBE',
        decimals: 18,
        balance: '0'
      }
    }

    try {
      const [name, symbol, decimals] = await Promise.all([
        this.contract.name(),
        this.contract.symbol(),
        this.contract.decimals()
      ])

      const balance = this.signer ? await this.getTokenBalance(await this.signer.getAddress()) : '0'

      return {
        name,
        symbol,
        decimals: Number(decimals),
        balance
      }
    } catch (error: any) {
      throw new Error(`获取代币信息失败: ${error.message}`)
    }
  }

  getContractAddress(): string {
    return contractConfig.contractAddress
  }
}