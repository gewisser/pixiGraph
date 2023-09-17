import PiXIPloter from './PiXIPloter'
import { Container, Graphics } from 'pixi.js'
import type { IMaskMargin, IPadding, IRange } from './models/BaseRendererModel'
import type { IPloterRect } from './models/PiXIPloterModel'

export default abstract class BaseRenderer extends Container {
  #ploter: PiXIPloter | undefined
  #mask: Graphics | undefined

  #maskMargin: IMaskMargin = {
    right: 0,
    bottom: 0,
    left: 0,
    top: 0
  }

  rangeInitial: IRange = {
    min: 0,
    max: 0
  }

  #padding: IPadding = {
    right: 0,
    bottom: 0,
    left: 0,
    top: 0
  }

  toPixWidth(val: number) {
    return this.map(val, this.rangeInitial.min, this.rangeInitial.max, 0, this.seriesWidth)
  }

  toPixHeight(val: number) {
    return this.map(val, this.rangeInitial.min, this.rangeInitial.max, 0, this.seriesHeight)
  }

  toValWidth(pix: number) {
    return this.map(pix, 0, this.seriesWidth, this.rangeInitial.min, this.rangeInitial.max)
  }

  toValHeight(pix: number) {
    return this.map(pix, 0, this.seriesHeight, this.rangeInitial.min, this.rangeInitial.max)
  }

  map(x: number, in_min: number, in_max: number, out_min: number, out_max: number) {
    return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
  }

  set ploter(val) {
    this.#ploter = val
  }

  get ploter() {
    return this.#ploter
  }

  get seriesHeight(): number {
    if (!this.ploter) {
      return 0
    }

    return this.ploter.screen.height - this.padding.bottom - this.maskMargin.bottom
  }

  get seriesWidth(): number {
    if (!this.ploter) {
      return 0
    }

    return this.ploter.screen.width - this.padding.right - this.maskMargin.right
  }

  set maskMargin(val: Partial<IMaskMargin>) {
    Object.assign(this.#maskMargin, val)

    this.updateMask()
  }

  get maskMargin(): Readonly<IMaskMargin> {
    return this.#maskMargin
  }

  set range(val: Partial<IRange>) {
    Object.assign(this.rangeInitial, val)
  }

  get range(): Readonly<IRange> {
    const rangeMin = this.toValWidth(-this.position.x)
    const rangeMax = this.rangeInitial.max - (this.rangeInitial.min - rangeMin)

    return {
      min: rangeMin,
      max: rangeMax
    }
  }

  set padding(val: Partial<IPadding>) {
    Object.assign(this.#padding, val)
  }

  get padding(): Readonly<IPadding> {
    return this.#padding
  }

  get maskRect(): IPloterRect | undefined {
    if (!this.ploter) {
      return
    }

    return {
      x: this.maskMargin.left,
      y: this.maskMargin.top,
      width: this.ploter.screen.width - this.maskMargin.left - this.maskMargin.right,
      height: this.ploter.screen.height - this.maskMargin.top - this.maskMargin.bottom
    }
  }

  updateMask() {
    const _maskRect = this.maskRect

    if (!_maskRect) {
      return
    }

    if (!this.#mask) {
      this.#mask = new Graphics()
      this.#mask.name = 'BaseRendererMask'

      this.mask = this.#mask
      //this.addChild(this.#mask)
    } else {
      this.#mask.clear()
    }

    this.#mask.beginFill(0xffffff)
    this.#mask.drawRect(_maskRect.x, _maskRect.y, _maskRect.width, _maskRect.height)
    this.#mask.lineStyle(0)
    this.#mask.endFill()
  }

  redraw(dirty?: boolean) {
    if (dirty) {
      this.updateMask()
    }
  }
}
