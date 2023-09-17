import { Application, FederatedPointerEvent, Rectangle } from 'pixi.js'
import BaseRenderer from './BaseRenderer'

import XAxis from './XAxis'
import type { IPloterRect } from './models/PiXIPloterModel'

export default class PiXIPloter extends Application {
  protected renderers: BaseRenderer[] = []

  constructor(container: HTMLElement) {
    super({
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      antialias: true,
      resizeTo: container,
      background: '#121826'
      //backgroundAlpha: 0
      //clearBeforeRender: false,
      //preserveDrawingBuffer: true,
      //legacy: true,
    })

    container.appendChild(this.view as unknown as Node)

    this.renderer.on('resize', () => {
      this.onResize().then()
    })

    window.globalThis.__PIXI_APP__ = this

    this.stage.eventMode = 'static'
    this.stage.on('pointerdown', this.onDragStart, this)
    this.stage.on('pointerup', this.onDragEnd, this)
    this.stage.on('pointerupoutside', this.onDragEnd, this)
  }

  onDragStart(event: FederatedPointerEvent) {
    this.stage.emit('onDragStart' as any, event)
    this.stage.on('pointermove', this.onDragMove, this)
  }

  onDragEnd(event: FederatedPointerEvent) {
    this.stage.off('pointermove', this.onDragMove, this)
    this.stage.emit('onDragEnd' as any, event)
  }

  onDragMove(event: FederatedPointerEvent) {
    this.stage.emit('onDragMove' as any, event)
  }

  updateHitArea(rect: IPloterRect) {
    this.stage.hitArea = new Rectangle(rect.x, rect.y, rect.width, rect.height)
  }

  async onResize() {
    await this.renderChild(true)
  }

  async renderChild(dirty = false) {
    this.renderers.forEach((renderer) => {
      renderer.redraw(dirty)
    })
  }

  addRenderer(renderer: BaseRenderer) {
    renderer.ploter = this

    if (renderer instanceof XAxis) {
      const maskRect = renderer.maskRect

      if (maskRect) {
        this.updateHitArea(maskRect)
      }
    }

    this.renderers.push(renderer)
    this.stage.addChild(renderer)
    renderer.redraw(true)
  }
}
