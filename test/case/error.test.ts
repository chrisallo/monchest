import BNError, { BNErrorCode } from "../../src/error"

describe('error', () => {
  const TEST_ERROR_MESSAGE = 'testerrormessage'

  test('new', () => {
    const err = new BNError({
      code: BNErrorCode.DEBUGGING_MODE_REQUIRED,
      message: TEST_ERROR_MESSAGE,
    })
    expect(err.code).toBe(BNErrorCode.DEBUGGING_MODE_REQUIRED)
    expect(err.message).toBe(TEST_ERROR_MESSAGE)
  })
  test('static', () => {
    const err = BNError.storageNotAvailable
    expect(err.code).toBe(BNErrorCode.STORAGE_NOT_AVAILABLE)
  })
})