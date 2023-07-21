import MonchestError, { MonchestErrorCode } from "../../src/error"

describe('error', () => {
  const TEST_ERROR_MESSAGE = 'testerrormessage'

  test('new', () => {
    const err = new MonchestError({
      code: MonchestErrorCode.DEBUGGING_MODE_REQUIRED,
      message: TEST_ERROR_MESSAGE,
    })
    expect(err.code).toBe(MonchestErrorCode.DEBUGGING_MODE_REQUIRED)
    expect(err.message).toBe(TEST_ERROR_MESSAGE)
  })
  test('static', () => {
    const err = MonchestError.storageNotAvailable
    expect(err.code).toBe(MonchestErrorCode.STORAGE_NOT_AVAILABLE)
  })
})