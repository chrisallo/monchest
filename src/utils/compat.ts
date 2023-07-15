
/**
 * @internal
 */
export const isBrowser = () => typeof document !== 'undefined'
  && typeof navigator !== 'undefined'
  && navigator.product !== 'ReactNative'

/**
 * @internal
 */
export const isLegacyEdgeBrowser = () => isBrowser()
  && !!navigator.userAgent
  && navigator.userAgent.includes('Edge/')