import GLError, { GLErrorCode } from "../../src/error"

describe('error', () => {
  const TEST_ERROR_MESSAGE = 'testerrormessage'

  test('new', () => {
    const err = new GLError({
      code: GLErrorCode.DEBUGGING_MODE_REQUIRED,
      message: TEST_ERROR_MESSAGE,
    })
    expect(err.code).toBe(GLErrorCode.DEBUGGING_MODE_REQUIRED)
    expect(err.message).toBe(TEST_ERROR_MESSAGE)
  })
  test('static', () => {
    const err = GLError.storageNotAvailable
    expect(err.code).toBe(GLErrorCode.STORAGE_NOT_AVAILABLE)
  })
})