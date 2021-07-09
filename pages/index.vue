<template>
  <div>
    <header id="header">
      <div class="title">
        <h1>Youtube Stories maker</h1>
      </div>
    </header>

    <aside>
      <div class="options">
        <div id="pick-image-1" class="control-items">
          <b-form @submit.prevent="onSubmit">
            <b-form-group
              id="input-group-1"
              label="Video:"
              label-for="inputVideo"
            >
              <b-form-input
                id="inputVideo"
                v-model="inputVideo"
                type="text"
                placeholder="Enter Video Url"
                required
              />
            </b-form-group>
            <b-button type="submit" variant="dark">
              Submit
            </b-button>
          </b-form>
        </div>
        <a id="saveimage" href="">download image</a>
      </div>
    </aside>

    <main id="main-area">
      <canvas id="c" width="800" height="800" />
    </main>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-var-requires */
import { Vue, Component } from 'vue-property-decorator'
import { fabric } from 'fabric'

@Component
export default class IndexComponent extends Vue {
  inputVideo = 'https://www.youtube.com/watch?v=K3Qzzggn--s';
  canvas : any;
  textbox: any;
  image : any;
  centerImage: any;

  mounted () : void {
    this.setupFabric()
  }

  setupFabric () : void {
    this.canvas = new fabric.Canvas('c', {
      preserveObjectStacking: true
    })

    this.canvas.backgroundColor = 'rgb(140,140,140)'

    // Clip to 360 x 640 section in middle of 800 x 800 canvas - 360 x 640 with multiplier 3 in export gives 1080 x 1920
    this.canvas.clipTo = (ctx): void => {
      ctx.rect(220, 80, 360, 640)
    }

    this.canvas.controlsAboveOverlay = true

    // Set up overlay image
    this.canvas.setOverlayImage(require('~/assets/images/overlay-bg.png'), this.canvas.renderAll.bind(this.canvas), {
      opacity: 0.5,
      angle: 0,
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top',
      crossOrigin: 'anonymous'
    })
    this.addFabricTextbox()
  }

  addFabricTextbox () : void {
    const textbox = new fabric.Textbox('Caption goes here - you can resize the text with the handles', {
      left: 240,
      top: 590,
      width: 320,
      fontSize: 28,
      fill: '#fff',
      fontFamily: 'Open Sans',
      fontWeight: 800,
      textAlign: 'center',
      borderColor: 'red',
      cornerColor: 'green',
      cornerSize: 12,
      transparentCorners: false
    })
    textbox.shadow = '0px 0px 10px rgba(0, 0, 0, 1)'
    this.canvas.add(textbox)
  }

  addCenterImage (img) : void {
    fabric.Image.fromURL(img, (image) => {
      const imageF = image.set({
        angle: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        centeredScaling: true,
        selectable: true,
        borderColor: 'red',
        cornerColor: 'green',
        cornerSize: 12,
        transparentCorners: false,
      });

      (imageF as fabric.Image).cloneAsImage((copy) => {
        this.centerImage = copy;
        (this.centerImage as any).set('shadow', {
          color: '#000',
          blur: 50,
          offsetX: -10,
          offsetY: 10
        })

        this.canvas.add(this.centerImage)
        this.canvas.centerObject(this.centerImage)
        this.canvas.moveTo(this.centerImage, 1)
      }, { width: 200, height: 200, left: 100, })
    })
  }

  onAddImage (img : string) : void {
    fabric.Image.fromURL(img, (image) => {
      this.image = image.set({
        angle: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        selectable: true,
        borderColor: 'red',
        cornerColor: 'green',
        cornerSize: 12,
        transparentCorners: false,
      })
      this.image.filters.push(new fabric.Image.filters.Saturation({ saturation: -0.631426 }))
      this.image.filters.push(new fabric.Image.filters.Brightness({ brightness: -0.153064 }))
      const blur = new (fabric.Image.filters as any).Blur({ blur: 0.1 })
      this.image.filters.push(blur)
      this.image.applyFilters()
      this.image.scaleToHeight(700)
      this.canvas.add(this.image)
      this.canvas.centerObject(this.image)
      this.canvas.moveTo(this.image, 0)
    }, { crossOrigin: 'anonymous' })
    // image.src = img
  }

  onSubmit (): void {
    const bg = this.getThumb(this.inputVideo)
    this.onAddImage(bg)
    this.addCenterImage(bg)
  }

  getThumb (url: string, size = '') : string {
    if (url === null) {
      return ''
    }
    size = (size === null) ? 'big' : size
    const results = url.match('[\\?&]v=([^&#]*)')
    const video = (results === null) ? url : results[1]

    if (size === 'small') {
      return 'http://img.youtube.com/vi/' + video + '/2.jpg'
    }
    return 'http://img.youtube.com/vi/' + video + '/maxresdefault.jpg'
  }
}
</script>
