import Axis from './Axis'
import { BitmapText, FederatedPointerEvent, Graphics, Sprite } from 'pixi.js'
import TickLineContainer from './TickLineContainer'
import { EScanDirection } from './models/Axis'

export default class XAxis extends Axis {
  static xAxisFontName = 'xAxisFontLabel'
  static compositTickLineName = 'TickLine'
  static compositTickLineLabelName = 'TickLineLabel'

  #startDragX = 0
  #xAxis: Graphics | undefined

  #sragStartPositionX = 0

  constructor() {
    super(XAxis.xAxisFontName)
    this.maskMargin = { right: 60 }
    this.padding = { bottom: 60 }
  }

  onDragStart(event: FederatedPointerEvent) {
    this.#sragStartPositionX = this.position.x
    this.#startDragX = this.#sragStartPositionX - event.x
  }

  onDragMove(event: FederatedPointerEvent) {
    this.position.x = event.x + this.#startDragX

    super.onDragMove(event)
  }

  createTextureTickLine(dirty = false) {
    const h = this.seriesHeight

    if (!this.ploter || h === undefined) {
      return
    }

    if (!this.textureGridLine || dirty) {
      const pg = new Graphics()

      pg.lineStyle(1, 0x2f3240, 1)
      pg.moveTo(0, 0)
      pg.lineTo(0, h)
      pg.closePath()

      pg.lineStyle(1, 0x838383, 1)
      pg.moveTo(0, h)
      pg.lineTo(0, h + 5)
      pg.closePath()

      this.destroyTextureTickLine()

      this.textureGridLine = this.ploter.renderer.generateTexture(pg)
    }

    return this.textureGridLine
  }

  createTickLine(scanDirection = EScanDirection.toMax, incTick?: number, text?: string | number) {
    if (incTick === undefined) {
      if (scanDirection === EScanDirection.toMax) {
        const lastChild = this.children[this.children.length - 1]

        if (lastChild instanceof TickLineContainer) {
          incTick = lastChild.incTick + this.tickInterval

          if (incTick >= this.range.max) {
            return
          }
        }
      } else {
        const firstChild = this.children[0]

        if (firstChild instanceof TickLineContainer) {
          incTick = firstChild.incTick - this.tickInterval

          if (incTick < this.range.min) {
            return
          }
        }
      }
    }

    if (incTick === undefined) {
      return
    }

    const h = this.seriesHeight

    if (h === 0) {
      return
    }

    const gridLine = new Sprite(this.createTextureTickLine())
    gridLine.name = XAxis.compositTickLineName

    const label = new BitmapText(String(text || incTick), {
      fontName: XAxis.xAxisFontName,
      fontSize: 11
    })

    label.anchor.x = 0.5

    label.name = XAxis.compositTickLineLabelName
    label.position.y = h + 10

    const tickLineContainer = new TickLineContainer()
    tickLineContainer.position.x = this.toPixWidth(incTick)

    tickLineContainer.incTick = incTick

    tickLineContainer.addChild(gridLine, label)

    if (scanDirection === EScanDirection.toMax) {
      this.addChild(tickLineContainer)
    } else {
      this.addChildAt(tickLineContainer, 0)
    }

    return tickLineContainer
  }

  redrawLine() {
    const h = this.seriesHeight

    if (!this.ploter || h === undefined) {
      return
    }

    if (!this.#xAxis) {
      this.#xAxis = new Graphics()
      this.#xAxis.name = 'lineX'
      this.ploter.stage.addChild(this.#xAxis)
    } else {
      this.#xAxis.clear()
    }

    this.#xAxis.lineStyle(1, 0x828282, 1)
    this.#xAxis.moveTo(0, 0)
    this.#xAxis.lineTo(this.ploter.screen.width, 0)
    this.#xAxis.closePath()

    this.#xAxis.position.y = h
  }
}
