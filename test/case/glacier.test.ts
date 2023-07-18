
import { GLError, Glacier } from '../../src/glacier'
import { Blob } from 'blob-polyfill'

describe('glacier', () => {
  const TEST_STORAGE_NAME = 'teststorage'
  const TEST_DATA_KEY = 'testdatakey'
  const TEST_DATA_RAW_BLOB = JSON.stringify({ x: 'your_id', y: 'blob_data', z: true })
  const TEST_DATA_VALUE = {
    string: 'testdatastring',
    object: { a: 9, b: 'teststring', c: true },
    blob: new Blob([TEST_DATA_RAW_BLOB], { type: 'application/json' }),
  }
  afterEach(async () => {
    const gl = new Glacier({
      name: TEST_STORAGE_NAME,
    })
    await gl.clear()
  })

  test('new', () => {
    const gl = new Glacier({
      name: TEST_STORAGE_NAME,
    })
    expect(gl.name).toBe(TEST_STORAGE_NAME)
  })
  test('getMemoryStoreForDebugging()', () => {
    const gl = new Glacier({
      name: TEST_STORAGE_NAME,
    })
    const func = jest.fn(() => {
      gl.getMemoryStoreForDebugging()
    })
    expect(func).toThrowError(GLError.debuggingModeRequired)
  })
  test('save() > load() string', async () => {
    const gl = new Glacier({
      name: TEST_STORAGE_NAME,
    })
    await gl.save(TEST_DATA_KEY, TEST_DATA_VALUE.string)
    
    const result = await gl.load(TEST_DATA_KEY)
    expect(result).toBe(TEST_DATA_VALUE.string)
  })
  test('save() > load() object', async () => {
    const gl = new Glacier({
      name: TEST_STORAGE_NAME,
    })
    await gl.save(TEST_DATA_KEY, TEST_DATA_VALUE.object)
    
    const result = await gl.load(TEST_DATA_KEY)
    expect(result).toStrictEqual(TEST_DATA_VALUE.object)
  })
  test('save() > load() blob', async () => {
    const gl = new Glacier({
      name: TEST_STORAGE_NAME,
    })
    await gl.save(TEST_DATA_KEY, TEST_DATA_VALUE.blob)
    
    const result: Blob = await gl.load(TEST_DATA_KEY)
    const text = await result.text()
    expect(text).toBe(TEST_DATA_RAW_BLOB)
  })
})