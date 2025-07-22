import React, { useState, useEffect } from 'react'
import { WalletService, WalletInfo } from './services/WalletService'
import { AirPollutionService, AirPollutionData } from './services/AirPollutionService'
import { RewardService, RewardResult } from './services/RewardService'
import { ClaimRecord } from './services/ClaimStorageService'
import { TokenInfo } from './services/VibeTokenService'

const App: React.FC = () => {
  const [walletService] = useState(() => new WalletService())
  const [airPollutionService] = useState(() => new AirPollutionService())
  const [rewardService] = useState(() => new RewardService(walletService, airPollutionService))

  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [pollutionData, setPollutionData] = useState<AirPollutionData | null>(null)
  const [rewardResult, setRewardResult] = useState<RewardResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{type: string, message: string} | null>(null)
  const [claimStatus, setClaimStatus] = useState<{canClaim: boolean; previousClaim?: ClaimRecord} | null>(null)
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [isSimulationMode, setIsSimulationMode] = useState(false)

  useEffect(() => {
    initializePrimus()
  }, [])

  useEffect(() => {
    if (walletInfo) {
      checkClaimStatus()
      loadTokenInfo()
    }
  }, [walletInfo])

  const loadTokenInfo = async () => {
    if (walletInfo) {
      try {
        const info = await rewardService.getTokenInfo()
        setTokenInfo(info)
        // 检查是否为模拟模式
        const contractAddress = rewardService.getContractAddress()
        setIsSimulationMode(contractAddress === '0x0000000000000000000000000000000000000000')
      } catch (error: any) {
        console.error('加载代币信息失败:', error)
        setIsSimulationMode(true)
      }
    }
  }

  const initializePrimus = async () => {
    try {
      await airPollutionService.initialize()
    } catch (error: any) {
      setStatus({type: 'error', message: error.message})
    }
  }

  const checkClaimStatus = () => {
    if (walletInfo) {
      const status = rewardService.checkClaimStatus(walletInfo.address)
      setClaimStatus(status)
    }
  }

  const connectWallet = async () => {
    setLoading(true)
    setStatus(null)
    
    try {
      const info = await walletService.connectWallet()
      setWalletInfo(info)
      
      if (info.chainId !== 10143) {
        setStatus({type: 'warning', message: '检测到您不在Monad测试网，正在切换...'})
        await walletService.switchToMonadTestnet()
        const updatedInfo = await walletService.connectWallet()
        setWalletInfo(updatedInfo)
      }
      
      setStatus({type: 'success', message: '钱包连接成功！'})
    } catch (error: any) {
      setStatus({type: 'error', message: error.message})
    } finally {
      setLoading(false)
    }
  }

  const checkAirPollution = async () => {
    if (!walletInfo) {
      setStatus({type: 'error', message: '请先连接钱包'})
      return
    }

    setLoading(true)
    setStatus(null)
    setPollutionData(null)
    setRewardResult(null)

    try {
      const data = await airPollutionService.getAirPollutionIndex(walletInfo.address)
      setPollutionData(data)
      
      const reward = await rewardService.simulateReward(data)
      setRewardResult(reward)
      
      setStatus({type: 'info', message: '空气质量数据获取成功！'})
    } catch (error: any) {
      setStatus({type: 'error', message: error.message})
    } finally {
      setLoading(false)
    }
  }

  const claimReward = async () => {
    if (!walletInfo) {
      setStatus({type: 'error', message: '请先连接钱包'})
      return
    }

    setLoading(true)
    setStatus(null)

    try {
      const result = await rewardService.checkAndReward(walletInfo.address)
      setRewardResult(result)
      
      if (result.success) {
        setStatus({type: 'success', message: `${result.message} 交易哈希: ${result.txHash}`})
        checkClaimStatus() // 更新领取状态
        loadTokenInfo() // 更新代币余额
      } else {
        if (result.alreadyClaimed) {
          setStatus({type: 'warning', message: result.message})
        } else {
          setStatus({type: 'error', message: result.message})
        }
      }
    } catch (error: any) {
      setStatus({type: 'error', message: error.message})
    } finally {
      setLoading(false)
    }
  }

  const addTokenToMetaMask = async () => {
    if (!walletInfo) {
      setStatus({type: 'error', message: '请先连接钱包'})
      return
    }

    try {
      setLoading(true)
      const contractAddress = rewardService.getContractAddress()
      
      const added = await walletService.addVibeTokenToMetaMask(contractAddress)
      
      if (added) {
        setStatus({type: 'success', message: 'VIBE代币已成功添加到MetaMask！'})
      } else {
        setStatus({type: 'warning', message: '用户取消了添加操作'})
      }
    } catch (error: any) {
      setStatus({type: 'error', message: error.message})
    } finally {
      setLoading(false)
    }
  }

  const clearClaimHistory = async () => {
    if (!walletInfo) {
      setStatus({type: 'error', message: '请先连接钱包'})
      return
    }

    if (!window.confirm('确定要清除本地交易记录吗？这只会清除本地存储的记录，不会影响区块链上的实际交易。')) {
      return
    }

    try {
      setLoading(true)
      rewardService.clearUserClaimRecord(walletInfo.address)
      setClaimStatus({canClaim: true, previousClaim: undefined})
      setRewardResult(null)
      setStatus({type: 'success', message: '本地交易记录已清除，您现在可以重新领取奖励（仅限测试）'})
    } catch (error: any) {
      setStatus({type: 'error', message: `清除记录失败: ${error.message}`})
    } finally {
      setLoading(false)
    }
  }

  const clearAllHistory = async () => {
    if (!window.confirm('确定要清除所有本地交易记录吗？这是管理员操作，将清除所有用户的本地记录。')) {
      return
    }

    try {
      setLoading(true)
      rewardService.clearAllClaimRecords()
      if (walletInfo) {
        setClaimStatus({canClaim: true, previousClaim: undefined})
      }
      setRewardResult(null)
      setStatus({type: 'success', message: '所有本地交易记录已清除'})
    } catch (error: any) {
      setStatus({type: 'error', message: `清除记录失败: ${error.message}`})
    } finally {
      setLoading(false)
    }
  }

  const renderStatus = () => {
    if (!status) return null
    
    return (
      <div className={`status ${status.type}`}>
        {status.message}
      </div>
    )
  }

  const renderLoading = () => {
    if (!loading) return null
    
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span style={{marginLeft: '10px'}}>处理中...</span>
      </div>
    )
  }

  const renderPollutionInfo = () => {
    if (!pollutionData) return null
    
    const aqiLevel = airPollutionService.getAQILevel(pollutionData.aqi)
    
    return (
      <div className="pollution-info">
        <h3>空气质量指数</h3>
        <div className={`pollution-value ${aqiLevel.color}`}>
          {pollutionData.aqi}
        </div>
        <div>
          <strong>等级：</strong>{aqiLevel.level}
        </div>
        <div>
          <strong>位置：</strong>{pollutionData.location}
        </div>
        <div>
          <strong>时间：</strong>{new Date(pollutionData.timestamp).toLocaleString()}
        </div>
        <p>{aqiLevel.description}</p>
      </div>
    )
  }

  const renderRewardInfo = () => {
    if (!rewardResult) return null
    
    return (
      <div className={`status ${rewardResult.success ? 'success' : rewardResult.alreadyClaimed ? 'warning' : 'error'}`}>
        <strong>奖励结果：</strong>
        {rewardResult.message}
      </div>
    )
  }

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>空气质量 VIBE 奖励 DApp</h1>
          <p>查询空气污染指数并获得 VIBE 代币奖励</p>
        </div>

        {renderStatus()}
        {renderLoading()}

        {/* 模拟模式提醒 */}
        {isSimulationMode && (
          <div className="status info">
            <strong>🧪 模拟模式：</strong>
            VIBE代币合约未部署，当前为演示模式。代币奖励为模拟发放，不是真实的区块链交易。
          </div>
        )}

        <div className="wallet-section">
          <h2>💳 钱包连接</h2>
          {!walletInfo ? (
            <button onClick={connectWallet} disabled={loading}>
              连接 MetaMask 钱包
            </button>
          ) : (
            <div className="wallet-info">
              <div><strong>地址：</strong>{walletInfo.address}</div>
              <div><strong>链ID：</strong>{walletInfo.chainId}</div>
              <div><strong>ETH余额：</strong>{parseFloat(walletInfo.balance).toFixed(4)} ETH</div>
              {tokenInfo && (
                <div><strong>VIBE余额：</strong>{parseFloat(tokenInfo.balance).toFixed(2)} VIBE</div>
              )}
              <button 
                onClick={addTokenToMetaMask} 
                disabled={loading || isSimulationMode}
                style={{
                  marginTop: '10px', 
                  fontSize: '0.9rem', 
                  padding: '8px 16px',
                  opacity: isSimulationMode ? 0.5 : 1
                }}
              >
                {isSimulationMode ? '合约未部署，无法添加' : '添加VIBE代币到MetaMask'}
              </button>
            </div>
          )}
        </div>

        <div className="pollution-section">
          <h2>🌫️ 空气质量查询</h2>
          <p>{rewardService.getRewardRule()}</p>
          
          <button 
            onClick={checkAirPollution} 
            disabled={loading || !walletInfo}
          >
            查询空气质量指数
          </button>

          {renderPollutionInfo()}
        </div>

        <div className="reward-section">
          <h2>🎁 VIBE 代币奖励</h2>
          {renderRewardInfo()}
          {claimStatus && !claimStatus.canClaim && claimStatus.previousClaim && (
            <div className="status warning">
              <strong>领取记录：</strong>
              您已于 {new Date(claimStatus.previousClaim.timestamp).toLocaleString()} 领取过 {claimStatus.previousClaim.amount} VIBE 代币
              {claimStatus.previousClaim.txHash && (
                <div style={{marginTop: '10px'}}>
                  <strong>交易哈希：</strong>
                  <div style={{fontSize: '0.9em', wordBreak: 'break-all', marginTop: '5px'}}>
                    {claimStatus.previousClaim.txHash}
                  </div>
                </div>
              )}
              <button 
                onClick={clearClaimHistory} 
                disabled={loading}
                style={{
                  marginTop: '10px', 
                  fontSize: '0.8rem', 
                  padding: '6px 12px',
                  backgroundColor: '#dc3545',
                  borderColor: '#dc3545'
                }}
              >
                清除本地记录 (测试用)
              </button>
            </div>
          )}
          
          <button 
            onClick={claimReward} 
            disabled={loading || !walletInfo || !pollutionData || (claimStatus && !claimStatus.canClaim)}
            style={{
              opacity: (claimStatus && !claimStatus.canClaim) ? 0.5 : 1,
              cursor: (claimStatus && !claimStatus.canClaim) ? 'not-allowed' : 'pointer'
            }}
          >
            {claimStatus && !claimStatus.canClaim ? '已领取奖励' : '领取 VIBE 奖励'}
          </button>

          {/* 管理员功能 */}
          <div style={{marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
            <h4 style={{margin: '0 0 10px 0', color: '#6c757d', fontSize: '0.9rem'}}>🔧 测试功能</h4>
            <button 
              onClick={clearAllHistory} 
              disabled={loading}
              style={{
                fontSize: '0.8rem', 
                padding: '6px 12px',
                backgroundColor: '#6c757d',
                borderColor: '#6c757d',
                width: '100%'
              }}
            >
              清除所有本地记录 (管理员)
            </button>
            <p style={{margin: '10px 0 0 0', fontSize: '0.75rem', color: '#6c757d'}}>
              注意：清除记录只影响本地存储，不会影响区块链上的实际交易
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App