import BaseRenderer from './BaseRenderer'
import { BitmapFont, FederatedPointerEvent, RenderTexture } from 'pixi.js'
import { EScanDirection } from './models/Axis'
import TickLineContainer from './TickLineContainer'
import type { IRange } from './models/BaseRendererModel'
import { debounce } from './utils/debounce'

export default abstract class Axis extends BaseRenderer {
  #minimumBetweenTicks = 40 // minimum width between ticks
  #tickEvery = 45 // ticks every x
  textureGridLine: RenderTexture | undefined
  tickInterval = 0

  destroyInvisibleTickDeb = debounce(this.destroyInvisibleTick, 5000)

  protected constructor(fontName = 'Axis') {
    super()

    this.generateBitmapFontForLabels(fontName)
  }

  set ploter(val) {
    if (!val) {
      return
    }

    val.stage.on('onDragStart' as any, this.onDragStart, this)

    //val.stage.on('onDragEnd' as any, this.onDragEnd, this)

    val.stage.on('onDragMove' as any, this.onDragMove, this)

    super.ploter = val
  }

  abstract onDragStart(event: FederatedPointerEvent): void
  //abstract onDragEnd(event: FederatedPointerEvent): void

  onDragMove(_event: FederatedPointerEvent) {
    this.destroyInvisibleTickDeb()
    this.fillVisibleRangeWithTicks()
    this.fillVisibleRangeWithTicks(false, EScanDirection.toMin)
  }

  get ploter() {
    return super.ploter
  }

  set range(val: Partial<IRange>) {
    super.range = val

    this.fillVisibleRangeWithTicks(true)
  }

  get range(): Readonly<IRange> {
    return super.range
  }

  set tickEvery(val: number) {
    this.#tickEvery = val

    this.fillVisibleRangeWithTicks(true)
  }

  get tickEvery() {
    return this.#tickEvery
  }

  set minimumBetweenTicks(val: number) {
    this.#minimumBetweenTicks = val
    this.fillVisibleRangeWithTicks(true)
  }

  get minimumBetweenTicks() {
    return this.#minimumBetweenTicks
  }

  calcTickInterval() {
    return (
      Math.ceil(
        this.minimumBetweenTicks / this.toPixWidth(this.rangeInitial.min + this.tickEvery)
      ) * this.tickEvery
    )
  }

  destroyTextureTickLine() {
    if (this.textureGridLine) {
      this.textureGridLine.destroy(true)
      this.textureGridLine = undefined
    }
  }

  destroyInvisibleTick() {
    for (let i = this.children.length - 1; i >= 0; i--) {
      const child = this.children[i]

      if (!(child instanceof TickLineContainer)) {
        continue
      }

      if (this.tickInRange(child)) {
        continue
      }

      this.removeChildAt(i).destroy({ children: true })
    }
  }

  generateBitmapFontForLabels(internalFontName: string) {
    BitmapFont.from(
      internalFontName,
      {
        fontFamily: 'Arial',
        fontSize: 40,
        //strokeThickness: 1,
        fill: 0x838383
      },
      {
        chars: [...BitmapFont.ALPHANUMERIC, '.()-']
      }
    )
  }

  destroyTicks() {
    this.removeChildren().forEach((child) => child.destroy(true))
  }

  tickInRange(container: TickLineContainer) {
    return container.incTick >= this.range.min && container.incTick <= this.range.max
  }

  abstract redrawLine(): void
  abstract createTickLine(
    scanDirection: EScanDirection,
    incTick?: number,
    text?: string | number
  ): TickLineContainer | undefined

  fillVisibleRangeWithTicks(dirty?: boolean, scanDirection = EScanDirection.toMax) {
    if (!this.ploter) {
      return
    }

    if (dirty) {
      this.tickInterval = this.calcTickInterval()

      const incTick = Math.ceil(this.rangeInitial.min / this.tickInterval) * this.tickInterval

      this.destroyTextureTickLine()
      this.destroyTicks()

      if (!this.createTickLine(EScanDirection.toMax, incTick)) {
        return
      }
    }

    while (this.createTickLine(scanDirection)) {
      /* empty */
    }
  }

  redraw(dirty?: boolean) {
    super.redraw(dirty)

    if (dirty) {
      this.redrawLine()
      this.fillVisibleRangeWithTicks(true)
    }
  }
}
