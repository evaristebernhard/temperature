export interface ClaimRecord {
  address: string
  timestamp: number
  aqi: number
  amount: number
  txHash?: string
}

export class ClaimStorageService {
  private static STORAGE_KEY = 'vibe_claim_records'

  static hasClaimed(address: string): boolean {
    const records = this.getClaimRecords()
    return records.some(record => record.address.toLowerCase() === address.toLowerCase())
  }

  static addClaimRecord(record: ClaimRecord): void {
    const records = this.getClaimRecords()
    const newRecord = {
      ...record,
      address: record.address.toLowerCase(),
      timestamp: Date.now()
    }
    records.push(newRecord)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records))
  }

  static getClaimRecords(): ClaimRecord[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('解析领取记录失败:', error)
      return []
    }
  }

  static getClaimRecord(address: string): ClaimRecord | null {
    const records = this.getClaimRecords()
    return records.find(record => record.address.toLowerCase() === address.toLowerCase()) || null
  }

  static clearClaimRecords(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  static clearUserClaim(address: string): void {
    const records = this.getClaimRecords()
    const filteredRecords = records.filter(record => 
      record.address.toLowerCase() !== address.toLowerCase()
    )
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredRecords))
  }

  static getClaimCount(): number {
    return this.getClaimRecords().length
  }
}