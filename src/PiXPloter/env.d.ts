import { Application } from 'pixi.js'

declare global {
  interface Window {
    globalThis: {
      __PIXI_APP__: Application
    }
  }
}
