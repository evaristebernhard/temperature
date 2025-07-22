import { WalletService } from './WalletService'
import { AirPollutionService, AirPollutionData } from './AirPollutionService'
import { VibeTokenService } from './VibeTokenService'
import { ClaimStorageService, ClaimRecord } from './ClaimStorageService'
import contractConfig from '../config/contract.json'

export interface RewardResult {
  success: boolean
  amount: number
  txHash?: string
  message: string
  alreadyClaimed?: boolean
}

export class RewardService {
  private walletService: WalletService
  private airPollutionService: AirPollutionService
  private vibeTokenService: VibeTokenService | null = null

  constructor(walletService: WalletService, airPollutionService: AirPollutionService) {
    this.walletService = walletService
    this.airPollutionService = airPollutionService
  }

  private getVibeTokenService(): VibeTokenService {
    const provider = this.walletService.getProvider()
    const signer = this.walletService.getSigner()
    
    if (!provider || !signer) {
      throw new Error('钱包未连接')
    }

    if (!this.vibeTokenService) {
      this.vibeTokenService = new VibeTokenService(provider, signer)
    }

    return this.vibeTokenService
  }

  async checkAndReward(userAddress: string): Promise<RewardResult> {
    try {
      if (!this.walletService.isConnected()) {
        throw new Error('钱包未连接')
      }

      const tokenService = this.getVibeTokenService()
      
      // 先检查智能合约状态
      const contractStatus = await tokenService.checkClaimStatus(userAddress)
      if (contractStatus.claimed) {
        return {
          success: false,
          amount: 0,
          alreadyClaimed: true,
          message: `该钱包已领取过 ${contractStatus.amount} VIBE 代币，每个钱包只能领取一次！`
        }
      }

      // 检查本地存储（双重保护）
      if (ClaimStorageService.hasClaimed(userAddress)) {
        const previousClaim = ClaimStorageService.getClaimRecord(userAddress)
        return {
          success: false,
          amount: 0,
          alreadyClaimed: true,
          message: `该钱包已于 ${new Date(previousClaim!.timestamp).toLocaleString()} 领取过 ${previousClaim!.amount} VIBE 代币，每个钱包只能领取一次！`
        }
      }

      const pollutionData = await this.airPollutionService.getAirPollutionIndex(userAddress)
      const rewardAmount = this.calculateReward(pollutionData.aqi)
      
      // 调用智能合约领取代币
      const txHash = await tokenService.claimTokens(pollutionData.aqi)

      // 记录成功的领取
      const claimRecord: ClaimRecord = {
        address: userAddress,
        timestamp: Date.now(),
        aqi: pollutionData.aqi,
        amount: rewardAmount,
        txHash: txHash
      }
      ClaimStorageService.addClaimRecord(claimRecord)

      const aqiLevel = this.airPollutionService.getAQILevel(pollutionData.aqi)
      
      // 检查是否为模拟模式
      const isSimulation = contractConfig.contractAddress === '0x0000000000000000000000000000000000000000'
      const modeText = isSimulation ? '（模拟模式）' : ''

      return {
        success: true,
        amount: rewardAmount,
        txHash,
        message: `当前空气质量指数: ${pollutionData.aqi} (${aqiLevel.level})，成功领取 ${rewardAmount} VIBE 代币${modeText}！`
      }
    } catch (error: any) {
      console.error('Reward error:', error)
      return {
        success: false,
        amount: 0,
        message: `奖励发放失败: ${error.message}`
      }
    }
  }

  private calculateReward(aqi: number): number {
    if (aqi > 50) {
      return 50
    } else {
      return 20
    }
  }

  async simulateReward(pollutionData: AirPollutionData): Promise<RewardResult> {
    const rewardAmount = this.calculateReward(pollutionData.aqi)
    const aqiLevel = this.airPollutionService.getAQILevel(pollutionData.aqi)

    return {
      success: true,
      amount: rewardAmount,
      message: `模拟奖励：当前空气质量指数 ${pollutionData.aqi} (${aqiLevel.level})，将获得 ${rewardAmount} VIBE 代币！`
    }
  }

  getRewardRule(): string {
    return '奖励规则：空气污染指数 > 50 时获得 50 VIBE，否则获得 20 VIBE（每个钱包仅可领取一次）'
  }

  checkClaimStatus(userAddress: string): { canClaim: boolean; previousClaim?: ClaimRecord } {
    // 优先检查智能合约状态
    try {
      const tokenService = this.getVibeTokenService()
      // 这里需要异步调用，但为了保持接口一致性，我们仍然使用本地存储
      const hasClaimed = ClaimStorageService.hasClaimed(userAddress)
      const previousClaim = hasClaimed ? ClaimStorageService.getClaimRecord(userAddress) : undefined
      
      return {
        canClaim: !hasClaimed,
        previousClaim: previousClaim || undefined
      }
    } catch (error) {
      // 如果无法获取智能合约状态，回退到本地存储
      const hasClaimed = ClaimStorageService.hasClaimed(userAddress)
      const previousClaim = hasClaimed ? ClaimStorageService.getClaimRecord(userAddress) : undefined
      
      return {
        canClaim: !hasClaimed,
        previousClaim: previousClaim || undefined
      }
    }
  }

  async getTokenBalance(userAddress: string): Promise<string> {
    try {
      const tokenService = this.getVibeTokenService()
      return await tokenService.getTokenBalance(userAddress)
    } catch (error: any) {
      console.error('获取代币余额失败:', error)
      return '0'
    }
  }

  async getTokenInfo() {
    try {
      const tokenService = this.getVibeTokenService()
      return await tokenService.getTokenInfo()
    } catch (error: any) {
      console.error('获取代币信息失败:', error)
      return null
    }
  }

  getTotalClaimsCount(): number {
    return ClaimStorageService.getClaimCount()
  }

  getContractAddress(): string {
    try {
      const tokenService = this.getVibeTokenService()
      return tokenService.getContractAddress()
    } catch (error) {
      return '0x0000000000000000000000000000000000000000'
    }
  }

  clearAllClaimRecords(): void {
    ClaimStorageService.clearClaimRecords()
  }

  clearUserClaimRecord(userAddress: string): void {
    ClaimStorageService.clearUserClaim(userAddress)
  }
}