
import BNMemoryStorage from '../../../src/storage/memoryStorage'

describe('storage/memoryStorage', () => {
  const TEST_STORAGE_NAME = 'teststorage'

  const generateTestData = (count = 1) => {
    return new Array(count).fill(null).map((_: any, i: number) => {
      return {
        key: `testkey_${i}`,
        value: {
          a: i + 1,
          b: `testdata_${i}`,
          c: i % 2 === 0,
        },
      }
    })
  }

  afterEach(async () => {
    const storage = new BNMemoryStorage({
      name: TEST_STORAGE_NAME,
    })
    await storage.clear()
  })

  test('new', async () => {
    const storage = new BNMemoryStorage({
      name: TEST_STORAGE_NAME,
    })
    await storage.init()

    expect(storage.name).toBe(TEST_STORAGE_NAME)
    expect(storage.rawData).toStrictEqual({})
  })
  test('getAllKeys() empty', async () => {
    const storage = new BNMemoryStorage({
      name: TEST_STORAGE_NAME,
    })
    await storage.init()

    const keys = await storage.getAllKeys()
    expect(keys).toHaveLength(0)
  })
  test('get() empty', async () => {
    const storage = new BNMemoryStorage({
      name: TEST_STORAGE_NAME,
    })
    await storage.init()

    const [data] = generateTestData()
    const value = await storage.get(data.key)
    expect(value).toBeNull()
  })
  test('set() > get()', async () => {
    const storage = new BNMemoryStorage({
      name: TEST_STORAGE_NAME,
    })
    await storage.init()

    const [data] = generateTestData()
    await storage.set(data.key, data.value)

    const value = await storage.get(data.key)
    expect(value).toStrictEqual(data.value)
  })
  test('set() > get() with encryption', async () => {
    const storage = new BNMemoryStorage({
      name: TEST_STORAGE_NAME,
      encryptionPolicy: {
        encrypt: (data: object) => {
          return JSON.stringify(data) + 'sampleencryptionkey'
        },
        decrypt: (encrypted: string) => {
          const len = encrypted.indexOf('sampleencryptionkey')
          return JSON.parse(encrypted.slice(0, len))
        },
      }
    })
    await storage.init()

    const [data] = generateTestData()
    await storage.set(data.key, data.value)

    const value = await storage.get(data.key)
    expect(value).toStrictEqual(data.value)
  })
  test('set() multiple shards > get()', async () => {
    const storage = new BNMemoryStorage({
      name: TEST_STORAGE_NAME,
      maxRawSize: 10,
    })
    await storage.init()

    const [data] = generateTestData()
    await storage.set(data.key, data)

    const value = await storage.get(data.key)
    expect(value).toStrictEqual(data)
  })
  test('set() > remove() > get()', async () => {
    const storage = new BNMemoryStorage({
      name: TEST_STORAGE_NAME,
    })
    await storage.init()

    const [data] = generateTestData()
    await storage.set(data.key, data)
    await storage.remove(data.key)

    const value = await storage.get(data.key)
    expect(value).toBeNull()
  })
  test('set() multiple shards > remove() > get()', async () => {
    const storage = new BNMemoryStorage({
      name: TEST_STORAGE_NAME,
      maxRawSize: 10,
    })
    await storage.init()

    const [data] = generateTestData()
    await storage.set(data.key, data.value)
    await storage.remove(data.key)
    
    const value = await storage.get(data.key)
    expect(value).toBeNull()
  })
  test('setMany() > get()', async () => {
    const storage = new BNMemoryStorage({
      name: TEST_STORAGE_NAME,
    })
    await storage.init()

    const list = generateTestData(3)
    await storage.setMany(list)

    const value1 = await storage.get(list[1].key)
    expect(value1).toStrictEqual(list[1].value)

    const value2 = await storage.get(list[0].key)
    expect(value2).toStrictEqual(list[0].value)

    const value3 = await storage.get(list[2].key)
    expect(value3).toStrictEqual(list[2].value)
  })
  test('setMany() multiple shards > get()', async () => {
    const storage = new BNMemoryStorage({
      name: TEST_STORAGE_NAME,
      maxRawSize: 10,
    })
    await storage.init()

    const list = generateTestData(3)
    await storage.setMany(list)

    const value1 = await storage.get(list[1].key)
    expect(value1).toStrictEqual(list[1].value)

    const value2 = await storage.get(list[0].key)
    expect(value2).toStrictEqual(list[0].value)

    const value3 = await storage.get(list[2].key)
    expect(value3).toStrictEqual(list[2].value)
  })
  test('setMany() > remove() > get()', async () => {
    const storage = new BNMemoryStorage({
      name: TEST_STORAGE_NAME,
    })
    await storage.init()
    
    const list = generateTestData(3)
    await storage.setMany(list)
    await storage.remove(list[1].key)

    const value = await storage.get(list[1].key)
    expect(value).toBeNull()
  })
  test('setMany() multiple shards > remove() > get()', async () => {
    const storage = new BNMemoryStorage({
      name: TEST_STORAGE_NAME,
      maxRawSize: 10,
    })
    await storage.init()

    const list = generateTestData(3)
    await storage.setMany(list)
    await storage.remove(list[1].key)

    const value = await storage.get(list[1].key)
    expect(value).toBeNull()
  })
  test('setMany() > removeMany() > get()', async () => {
    const storage = new BNMemoryStorage({
      name: TEST_STORAGE_NAME,
    })
    await storage.init()

    const list = generateTestData(3)
    await storage.setMany(list)
    await storage.removeMany([list[1].key, list[2].key])

    const value1 = await storage.get(list[0].key)
    expect(value1).not.toBeNull()

    const value2 = await storage.get(list[1].key)
    expect(value2).toBeNull()

    const value3 = await storage.get(list[2].key)
    expect(value3).toBeNull()
  })
  test('setMany() multiple shards > removeMany() > get()', async () => {
    const storage = new BNMemoryStorage({
      name: TEST_STORAGE_NAME,
      maxRawSize: 10,
    })
    await storage.init()
    
    const list = generateTestData(3)
    await storage.setMany(list)
    await storage.removeMany([list[1].key, list[2].key])

    const value1 = await storage.get(list[0].key)
    expect(value1).not.toBeNull()

    const value2 = await storage.get(list[1].key)
    expect(value2).toBeNull()

    const value3 = await storage.get(list[2].key)
    expect(value3).toBeNull()
  })
})