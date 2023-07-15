
export const isBrowser = () => typeof document !== 'undefined'
  && typeof navigator !== 'undefined'
  && navigator.product !== 'ReactNative'

export const isLegacyEdgeBrowser = () => isBrowser()
  && !!navigator.userAgent
  && navigator.userAgent.includes('Edge/')