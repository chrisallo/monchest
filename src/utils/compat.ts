
/**
 * @internal
 */
export const isBrowser = (): boolean => typeof document !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  navigator.product !== 'ReactNative'

/**
 * @internal
 */
export const isLegacyEdgeBrowser = (): boolean => isBrowser() &&
  typeof navigator.userAgent === 'string' &&
  navigator.userAgent.includes('Edge/')
