import { Container } from 'pixi.js'

export default class TickLineContainer extends Container {
  public incTick = 0

  constructor() {
    super()

    this.interactiveChildren = false
    this.cullable = true
  }
}
