import BarnetError, { BarnetErrorCode } from "../../src/error"

describe('error', () => {
  const TEST_ERROR_MESSAGE = 'testerrormessage'

  test('new', () => {
    const err = new BarnetError({
      code: BarnetErrorCode.DEBUGGING_MODE_REQUIRED,
      message: TEST_ERROR_MESSAGE,
    })
    expect(err.code).toBe(BarnetErrorCode.DEBUGGING_MODE_REQUIRED)
    expect(err.message).toBe(TEST_ERROR_MESSAGE)
  })
  test('static', () => {
    const err = BarnetError.storageNotAvailable
    expect(err.code).toBe(BarnetErrorCode.STORAGE_NOT_AVAILABLE)
  })
})