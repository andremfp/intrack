import { useSyncExternalStore } from "react"

const MOBILE_BREAKPOINT = 768

// Subscribe to viewport changes via the breakpoint media query.
const subscribe = (callback: () => void) => {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener("change", callback)
  return () => mql.removeEventListener("change", callback)
}

// Read the current "is mobile" value straight from the live viewport width.
const getSnapshot = () => window.innerWidth < MOBILE_BREAKPOINT

// No viewport on the server; default to non-mobile.
const getServerSnapshot = () => false

export function useIsMobile() {
  // useSyncExternalStore keeps the value in sync with the media query without
  // an effect-driven setState (react-hooks/set-state-in-effect).
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
