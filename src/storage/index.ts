
import { warning } from '../utils/logger'

export interface GLEncryptionPolicy {
  /**
   * @describe
   *  The function to encrypt an object to an encrypted string.
   */
  encrypt: (data: object) => string

  /**
   * @describe
   *  The function to decrypt an encrypted string to the original data.
   */
  decrypt: (encrypted: string) => object
}

/**
 * @internal
 */
export interface GLStorageProps {
  name: string
  maxRawSize?: number
  encryptionPolicy?: GLEncryptionPolicy
}

/**
 * @internal
 */
export interface GLStorageData {
  key: string
  value: object
}

/**
 * @internal
 */
interface GLStorageDataShard {
  key: string
  value: string
  numberOfShards?: number
}

const DEFAULT_ENCRYPTION_POLICY: GLEncryptionPolicy = {
  encrypt: (data: object) => JSON.stringify(data),
  decrypt: (encrypted: string) => JSON.parse(encrypted),
}
const ENCRYPTION_CHECK_DUMMY = { a: 100, n: 'stacktrace' }
const DEFAULT_MAX_RAW_SIZE = 4096
const MINIMUM_MAX_RAW_SIZE = 10

export default abstract class GLStorage {
  readonly name: string
  readonly encryptionPolicy: GLEncryptionPolicy
  protected readonly maxRawSize: number

  private get reservedKeys(): string[] {
    return [
      `${this.name}.encryptcheck`,
    ]
  }

  abstract init(): Promise<void>
  abstract clear(): Promise<void>

  protected abstract getAllRawKeys(): Promise<string[]>
  protected abstract getRaw(key: string): Promise<object | null>
  protected abstract setRaw(data: GLStorageData[]): Promise<void>
  protected abstract removeRaw(keys: string[]): Promise<void>

  protected async resetIfEncryptionChanged(): Promise<void> {
    const encryptCheckKey = `${this.name}.encryptcheck`
    const previousEncrypted = await this.get(encryptCheckKey) as { encrypted: string } | null
    const currentEncrypted = {
      encrypted: this.encryptionPolicy.encrypt(ENCRYPTION_CHECK_DUMMY)
    }
    if (previousEncrypted) {
      const previousStringifiedEncryptedSeed = previousEncrypted.encrypted
      const currentStringifiedEncryptedSeed = currentEncrypted.encrypted
      if (previousStringifiedEncryptedSeed !== currentStringifiedEncryptedSeed) {
        warning('Encryption algorithm has changed. Stored data would be cleared.')
        await this.clear()
      }
    }
    await this.set(encryptCheckKey, currentEncrypted)
  }

  private createRawKey(key: string, index = 0): string {
    return `${this.name}.${key}.${index}`
  }
  private generateShardPostfixArray(count = 1): number[] {
    return [...Array(count).keys()]
  }
  private shardify(item: GLStorageData): GLStorageDataShard[] {
    const { key, value } = item
    const data = this.encryptionPolicy.encrypt(value)
    const numberOfshards = Math.ceil(data.length / this.maxRawSize)

    return this.generateShardPostfixArray(numberOfshards)
      .map((index: number) => {
        const rawKey = this.createRawKey(key, index)
        const shard: GLStorageDataShard = {
          key: rawKey,
          value: data.substring(index * this.maxRawSize, (index + 1) * this.maxRawSize),
        }
        if (index === 0) {
          shard.numberOfShards = numberOfshards
        }
        return shard
      })
  }

  constructor(props: GLStorageProps) {
    const {
      name,
      maxRawSize,
      encryptionPolicy = DEFAULT_ENCRYPTION_POLICY,
    } = props
    this.name = name
    this.encryptionPolicy = encryptionPolicy
    this.maxRawSize = maxRawSize ? Math.max(maxRawSize, MINIMUM_MAX_RAW_SIZE) : DEFAULT_MAX_RAW_SIZE
  }
  async getAllKeys(): Promise<string[]> {
    const rawKeys = await this.getAllRawKeys()
    return rawKeys
      .filter((key: string) => key.endsWith('.0'))
      .map((key: string) => key.replace(/\.0$/, ''))
      .filter((key: string) => !this.reservedKeys.includes(key))
  }
  async get(key: string): Promise<object | null> {
    const rawKey = this.createRawKey(key)
    const rawData = await this.getRaw(rawKey)
    if (rawData) {
      try {
        const { value, numberOfShards } = rawData as GLStorageDataShard
        const shards = numberOfShards && numberOfShards > 1
          ? await Promise.all(
            this.generateShardPostfixArray(numberOfShards)
              .map(async (index: number) => {
                if (index > 0) {
                  const rawKey = this.createRawKey(key, index)
                  const rawData = await this.getRaw(rawKey) as GLStorageDataShard
                  return rawData?.value
                } else return value
              }),
          )
          : [value]
        return this.encryptionPolicy.decrypt(JSON.parse(shards.join('')))
      } catch (err) {
        return null
      }
    }
    return null
  }
  async set(key: string, value: object): Promise<void> {
    const shards = this.shardify({ key, value })
    await this.setRaw(shards.map((shard: GLStorageDataShard) => {
      return {
        key: shard.key,
        value: shard,
      }
    }))
  }
  async setMany(items: GLStorageData[]): Promise<void> {
    const shards: GLStorageDataShard[] = []
    shards.concat(...items.map((item: GLStorageData) => this.shardify(item)))
    await this.setRaw(shards.map((shard: GLStorageDataShard) => {
      return {
        key: shard.key,
        value: shard,
      }
    }))
  }
  async remove(key: string): Promise<boolean> {
    const rawKey = this.createRawKey(key)
    const rawData = await this.getRaw(rawKey)
    if (rawData) {
      const { numberOfShards } = rawData as GLStorageDataShard
      await this.removeRaw(
        this.generateShardPostfixArray(numberOfShards)
          .map((index: number) => this.createRawKey(key, index)),
      )
      return true
    }
    return false
  }
  async removeMany(keys: string[]): Promise<void> {
    const rawKeys: string[] = []
    for (const key of keys) {
      const rawKey = this.createRawKey(key)
      const rawData = await this.getRaw(rawKey)
      if (rawData) {
        const { numberOfShards } = rawData as GLStorageDataShard
        rawKeys.push(...this.generateShardPostfixArray(numberOfShards)
          .map((index: number) => this.createRawKey(key, index)))
      }
    }
    if (rawKeys.length > 0) {
      await this.removeRaw(rawKeys)
    }
  }
}
