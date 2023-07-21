
import { MonchestError, Monchest } from '../../src/monchest'
import { Blob } from 'blob-polyfill'

describe('monchest', () => {
  const TEST_STORAGE_NAME = 'teststorage'
  const TEST_DATA_KEY = 'testdatakey'
  const TEST_DATA_RAW_BLOB = JSON.stringify({ x: 'your_id', y: 'blob_data', z: true })
  const TEST_DATA_VALUE = {
    string: 'testdatastring',
    object: { a: 9, b: 'teststring', c: true },
    blob: new Blob([TEST_DATA_RAW_BLOB], { type: 'application/json' }),
  }
  afterEach(async () => {
    const monchest = new Monchest({
      name: TEST_STORAGE_NAME,
    })
    await monchest.clear()
  })

  test('new', () => {
    const monchest = new Monchest({
      name: TEST_STORAGE_NAME,
    })
    expect(monchest.name).toBe(TEST_STORAGE_NAME)
  })
  test('getMemoryStoreForDebugging()', () => {
    const monchest = new Monchest({
      name: TEST_STORAGE_NAME,
    })
    const func = jest.fn(() => {
      monchest.getMemoryStoreForDebugging()
    })
    expect(func).toThrowError(MonchestError.debuggingModeRequired)
  })
  test('save() > load() string', async () => {
    const monchest = new Monchest({
      name: TEST_STORAGE_NAME,
    })
    await monchest.save(TEST_DATA_KEY, TEST_DATA_VALUE.string)
    
    const result = await monchest.load(TEST_DATA_KEY)
    expect(result).toBe(TEST_DATA_VALUE.string)
  })
  test('save() > load() object', async () => {
    const monchest = new Monchest({
      name: TEST_STORAGE_NAME,
    })
    await monchest.save(TEST_DATA_KEY, TEST_DATA_VALUE.object)
    
    const result = await monchest.load(TEST_DATA_KEY)
    expect(result).toStrictEqual(TEST_DATA_VALUE.object)
  })
  test('save() > load() blob', async () => {
    const monchest = new Monchest({
      name: TEST_STORAGE_NAME,
    })
    await monchest.save(TEST_DATA_KEY, TEST_DATA_VALUE.blob)
    
    const result: Blob = await monchest.load(TEST_DATA_KEY)
    const text = await result.text()
    expect(text).toBe(TEST_DATA_RAW_BLOB)
  })
  test('save() > remove() > load() string', async () => {
    const monchest = new Monchest({
      name: TEST_STORAGE_NAME,
    })
    await monchest.save(TEST_DATA_KEY, TEST_DATA_VALUE.string)
    await monchest.remove(TEST_DATA_KEY)
    
    const result = await monchest.load(TEST_DATA_KEY)
    expect(result).toBeNull()
  })
  test('save() > remove() > load() object', async () => {
    const monchest = new Monchest({
      name: TEST_STORAGE_NAME,
    })
    await monchest.save(TEST_DATA_KEY, TEST_DATA_VALUE.object)
    await monchest.remove(TEST_DATA_KEY)
    
    const result = await monchest.load(TEST_DATA_KEY)
    expect(result).toBeNull()
  })
  test('save() > remove() > load() blob', async () => {
    const monchest = new Monchest({
      name: TEST_STORAGE_NAME,
    })
    await monchest.save(TEST_DATA_KEY, TEST_DATA_VALUE.blob)
    await monchest.remove(TEST_DATA_KEY)
    
    const result: Blob = await monchest.load(TEST_DATA_KEY)
    expect(result).toBeNull()
  })
  test('save() > clear() > load() string', async () => {
    const monchest = new Monchest({
      name: TEST_STORAGE_NAME,
    })
    await monchest.save(TEST_DATA_KEY, TEST_DATA_VALUE.string)
    await monchest.clear()
    
    const result = await monchest.load(TEST_DATA_KEY)
    expect(result).toBeNull()
  })
  test('save() > clear() > load() object', async () => {
    const monchest = new Monchest({
      name: TEST_STORAGE_NAME,
    })
    await monchest.save(TEST_DATA_KEY, TEST_DATA_VALUE.object)
    await monchest.clear()
    
    const result = await monchest.load(TEST_DATA_KEY)
    expect(result).toBeNull()
  })
  test('save() > clear() > load() blob', async () => {
    const monchest = new Monchest({
      name: TEST_STORAGE_NAME,
    })
    await monchest.save(TEST_DATA_KEY, TEST_DATA_VALUE.blob)
    await monchest.clear()
    
    const result: Blob = await monchest.load(TEST_DATA_KEY)
    expect(result).toBeNull()
  })
})