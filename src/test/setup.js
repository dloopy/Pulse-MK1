import '@testing-library/jest-dom'

// Node 25+ ships its own localStorage, which is undefined without --localstorage-file and
// shadows jsdom's. Point the tests back at the browser one.
if (typeof localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: globalThis.jsdom.window.localStorage,
    configurable: true,
  })
}
