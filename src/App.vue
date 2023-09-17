<template>
  <div style="width: 100%; height: 100%" ref="chart"></div>
</template>

<script setup lang="ts">
import PiXIPloter from '@/PiXPloter/PiXIPloter'
import XAxis from '@/PiXPloter/XAxis'
import { onMounted, ref } from 'vue'
//import { Container, Texture, Sprite } from 'pixi.js'

const chart = ref()

onMounted(() => {
  if (!chart.value) {
    return
  }

  const piXIPloter = new PiXIPloter(chart.value)

  const xAxis = new XAxis()
  xAxis.range = { min: 980, max: 10506 }

  piXIPloter.addRenderer(xAxis)

  // const container = new Container()
  //
  // piXIPloter.app.stage.addChild(container)
  //
  // const texture = Texture.from('https://pixijs.com/assets/bunny.png')
  //
  // for (let i = 0; i < 25; i++) {
  //   const bunny = new Sprite(texture)
  //
  //   bunny.anchor.set(0.5)
  //   bunny.x = (i % 5) * 40
  //   bunny.y = Math.floor(i / 5) * 40
  //   container.addChild(bunny)
  // }
  //
  // container.x = piXIPloter.app.screen.width / 2
  // container.y = piXIPloter.app.screen.height / 2
})
</script>
