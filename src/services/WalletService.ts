import { ethers } from 'ethers'

export interface WalletInfo {
  address: string
  chainId: number
  balance: string
}

export class WalletService {
  private provider: ethers.BrowserProvider | null = null
  private signer: ethers.JsonRpcSigner | null = null

  async connectWallet(): Promise<WalletInfo> {
    if (!window.ethereum) {
      throw new Error('请安装MetaMask钱包')
    }

    try {
      this.provider = new ethers.BrowserProvider(window.ethereum)
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length === 0) {
        throw new Error('未找到钱包账户')
      }

      this.signer = await this.provider.getSigner()
      const address = await this.signer.getAddress()
      const balance = await this.provider.getBalance(address)
      const network = await this.provider.getNetwork()

      return {
        address,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance)
      }
    } catch (error: any) {
      throw new Error(`钱包连接失败: ${error.message}`)
    }
  }

  async switchToMonadTestnet(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('请安装MetaMask钱包')
    }

    const monadTestnet = {
      chainId: '0x279F', // 10143 in decimal
      chainName: 'Monad Testnet',
      rpcUrls: ['https://testnet-rpc.monad.xyz'],
      nativeCurrency: {
        name: 'MON',
        symbol: 'MON',
        decimals: 18
      },
      blockExplorerUrls: ['https://testnet.monadexplorer.com']
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: monadTestnet.chainId }]
      })
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [monadTestnet]
          })
        } catch (addError: any) {
          throw new Error(`添加Monad测试网失败: ${addError.message}`)
        }
      } else {
        throw new Error(`切换到Monad测试网失败: ${switchError.message}`)
      }
    }
  }

  async addVibeTokenToMetaMask(contractAddress: string): Promise<boolean> {
    if (!window.ethereum) {
      throw new Error('请安装MetaMask钱包')
    }

    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: contractAddress,
            symbol: 'VIBE',
            decimals: 18,
            image: 'https://via.placeholder.com/64x64.png?text=VIBE', // 您可以替换为真实的代币图标
          },
        },
      })

      return wasAdded
    } catch (error: any) {
      throw new Error(`添加VIBE代币到MetaMask失败: ${error.message}`)
    }
  }

  isConnected(): boolean {
    return this.provider !== null && this.signer !== null
  }

  getSigner(): ethers.JsonRpcSigner | null {
    return this.signer
  }

  getProvider(): ethers.BrowserProvider | null {
    return this.provider
  }
}

declare global {
  interface Window {
    ethereum: any
  }
}