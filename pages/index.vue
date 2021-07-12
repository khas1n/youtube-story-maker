<template>
  <div>
    <b-navbar variant="dark" type="dark">
      <b-navbar-brand href="#">
        Youtube Stories maker
      </b-navbar-brand>
      <b-form class="col-6" inline @submit.prevent="onSubmit">
        <b-form-input
          id="inputVideo"
          v-model="inputVideo"
          type="text"
          placeholder="Enter Video Url"
          required
          class="mb-2 mr-sm-2 mb-sm-0 col-6"
        />
        <b-button type="submit" variant="primary">
          Submit
        </b-button>
      </b-form>
      <b-button v-if="!$auth.loggedIn" type="button" variant="primary" @click="onLoginGoogle">
        Login With Google
      </b-button>
    </b-navbar>

    <aside>
      <div class="options">
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

  async onLoginGoogle () : Promise<void> {
    await this.$auth.loginWith('google')
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

  // eslint-disable-next-line @typescript-eslint/ban-types
  addFabricTextbox (title = '', option : object = {}) : void {
    const optionDefault = {
      left: 240,
      top: 590,
      width: 320,
      fontSize: 28,
      fill: '#fff',
      fontFamily: 'Open Sans',
      fontWeight: 800,
      textAlign: 'center',
      cornerSize: 12,
      transparentCorners: false,
      selectable: false,
    }
    const textbox = new fabric.Textbox(title, {
      ...optionDefault,
      ...option
    })
    textbox.shadow = '0px 0px 10px rgba(0, 0, 0, 1)'
    this.canvas.add(textbox)
  }

  addCenterImage (img) : void {
    fabric.Image.fromURL(img, (image) => {
      const imageF = image.set({
        top: 550,
        angle: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        centeredScaling: true,
        selectable: false,
        borderColor: 'red',
        cornerColor: 'green',
        cornerSize: 12,
        transparentCorners: true,
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
        this.canvas.centerObjectH(this.centerImage)
        this.centerImage.top = 280
        this.centerImage.setCoords()
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

  async onSubmit (): Promise<void> {
    if (this.$auth.loggedIn) {
      const videoId = this.getVideoId(this.inputVideo)
      const res = await this.$videoService.detail(videoId)
      console.log('res: ', res)
      const items = res.items[0]
      if (items) {
        const bg = this.getThumb(this.inputVideo)
        this.onAddImage(bg)
        this.addCenterImage(bg)

        const title = items.snippet.title
        const channelTitle = items.snippet.channelTitle

        this.addFabricTextbox(title, { fontSize: 12, top: 500, })
        this.addFabricTextbox(channelTitle, { fontSize: 12, top: 530, fill: '#eaeaea' })
      }
    } else {
      this.onLoginGoogle()
    }
  }

  getVideoId (url: string,) : string {
    const results = url.match('[\\?&]v=([^&#]*)')
    const videoId = (results === null) ? url : results[1]
    return videoId
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
