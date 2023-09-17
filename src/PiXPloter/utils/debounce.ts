/* eslint-disable @typescript-eslint/no-explicit-any */
export function debounce<F extends (...args: any[]) => any>(
  fn: F,
  wait = 250,
  immediate?: boolean
) {
  let timeout: NodeJS.Timeout | undefined

  function debounced(this: any, ...args: any[]) {
    const later = () => {
      timeout = undefined

      if (!immediate) {
        fn.apply(this, args)
      }
    }

    clearTimeout(timeout)

    if (immediate && timeout === void 0) {
      fn.apply(this, args)
    }

    timeout = setTimeout(later, wait)
  }

  debounced.cancel = () => {
    clearTimeout(timeout)
  }

  return debounced
}
