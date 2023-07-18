
import { BarnetError, Barnet } from '../../src/barnet'
import { Blob } from 'blob-polyfill'

describe('barnet', () => {
  const TEST_STORAGE_NAME = 'teststorage'
  const TEST_DATA_KEY = 'testdatakey'
  const TEST_DATA_RAW_BLOB = JSON.stringify({ x: 'your_id', y: 'blob_data', z: true })
  const TEST_DATA_VALUE = {
    string: 'testdatastring',
    object: { a: 9, b: 'teststring', c: true },
    blob: new Blob([TEST_DATA_RAW_BLOB], { type: 'application/json' }),
  }
  afterEach(async () => {
    const barnet = new Barnet({
      name: TEST_STORAGE_NAME,
    })
    await barnet.clear()
  })

  test('new', () => {
    const barnet = new Barnet({
      name: TEST_STORAGE_NAME,
    })
    expect(barnet.name).toBe(TEST_STORAGE_NAME)
  })
  test('getMemoryStoreForDebugging()', () => {
    const barnet = new Barnet({
      name: TEST_STORAGE_NAME,
    })
    const func = jest.fn(() => {
      barnet.getMemoryStoreForDebugging()
    })
    expect(func).toThrowError(BarnetError.debuggingModeRequired)
  })
  test('save() > load() string', async () => {
    const barnet = new Barnet({
      name: TEST_STORAGE_NAME,
    })
    await barnet.save(TEST_DATA_KEY, TEST_DATA_VALUE.string)
    
    const result = await barnet.load(TEST_DATA_KEY)
    expect(result).toBe(TEST_DATA_VALUE.string)
  })
  test('save() > load() object', async () => {
    const barnet = new Barnet({
      name: TEST_STORAGE_NAME,
    })
    await barnet.save(TEST_DATA_KEY, TEST_DATA_VALUE.object)
    
    const result = await barnet.load(TEST_DATA_KEY)
    expect(result).toStrictEqual(TEST_DATA_VALUE.object)
  })
  test('save() > load() blob', async () => {
    const barnet = new Barnet({
      name: TEST_STORAGE_NAME,
    })
    await barnet.save(TEST_DATA_KEY, TEST_DATA_VALUE.blob)
    
    const result: Blob = await barnet.load(TEST_DATA_KEY)
    const text = await result.text()
    expect(text).toBe(TEST_DATA_RAW_BLOB)
  })
  test('save() > remove() > load() string', async () => {
    const barnet = new Barnet({
      name: TEST_STORAGE_NAME,
    })
    await barnet.save(TEST_DATA_KEY, TEST_DATA_VALUE.string)
    await barnet.remove(TEST_DATA_KEY)
    
    const result = await barnet.load(TEST_DATA_KEY)
    expect(result).toBeNull()
  })
  test('save() > remove() > load() object', async () => {
    const barnet = new Barnet({
      name: TEST_STORAGE_NAME,
    })
    await barnet.save(TEST_DATA_KEY, TEST_DATA_VALUE.object)
    await barnet.remove(TEST_DATA_KEY)
    
    const result = await barnet.load(TEST_DATA_KEY)
    expect(result).toBeNull()
  })
  test('save() > remove() > load() blob', async () => {
    const barnet = new Barnet({
      name: TEST_STORAGE_NAME,
    })
    await barnet.save(TEST_DATA_KEY, TEST_DATA_VALUE.blob)
    await barnet.remove(TEST_DATA_KEY)
    
    const result: Blob = await barnet.load(TEST_DATA_KEY)
    expect(result).toBeNull()
  })
  test('save() > clear() > load() string', async () => {
    const barnet = new Barnet({
      name: TEST_STORAGE_NAME,
    })
    await barnet.save(TEST_DATA_KEY, TEST_DATA_VALUE.string)
    await barnet.clear()
    
    const result = await barnet.load(TEST_DATA_KEY)
    expect(result).toBeNull()
  })
  test('save() > clear() > load() object', async () => {
    const barnet = new Barnet({
      name: TEST_STORAGE_NAME,
    })
    await barnet.save(TEST_DATA_KEY, TEST_DATA_VALUE.object)
    await barnet.clear()
    
    const result = await barnet.load(TEST_DATA_KEY)
    expect(result).toBeNull()
  })
  test('save() > clear() > load() blob', async () => {
    const barnet = new Barnet({
      name: TEST_STORAGE_NAME,
    })
    await barnet.save(TEST_DATA_KEY, TEST_DATA_VALUE.blob)
    await barnet.clear()
    
    const result: Blob = await barnet.load(TEST_DATA_KEY)
    expect(result).toBeNull()
  })
})