
import { sleep } from '../../../src/utils/sleep'

describe('sleep', () => {
  test('sleep()', async () => {
    const bt = Date.now()
    await sleep(100)
    const et = Date.now()
    expect(et - bt).toBeGreaterThanOrEqual(100)
  })
})