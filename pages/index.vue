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
      <b-button type="button" variant="primary" @click="onDownloadImage">
        Download Image
      </b-button>
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
  inputVideo = 'https://www.youtube.com/watch?v=v4pi1LxuDHc';
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
      selectable: true,
    }
    const textbox = new fabric.Textbox(title, {
      ...optionDefault,
      ...option
    })
    textbox.shadow = '0px 0px 10px rgba(0, 0, 0, 1)'
    this.canvas.add(textbox)
    this.canvas.moveTo(textbox, 10)
  }

  dataURLToBlob (dataURL : string) : Blob {
    const BASE64_MARKER = ';base64,'

    if (!dataURL.includes(BASE64_MARKER)) {
      const parts = dataURL.split(',')
      const contentType = parts[0].split(':')[1]
      const raw = decodeURIComponent(parts[1])

      return new Blob([raw], { type: contentType })
    }

    const parts = dataURL.split(BASE64_MARKER)
    const contentType = parts[0].split(':')[1]
    const raw = window.atob(parts[1])
    const rawLength = raw.length

    const uInt8Array = new Uint8Array(rawLength)

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i)
    }

    return new Blob([uInt8Array], { type: contentType })
  }

  onDownloadImage (): void {
    this.canvas.overlayImage = null
    this.canvas.renderAll.bind(this.canvas)
    // Remove canvas clipping so export the image
    this.canvas.clipTo = null
    // Export the canvas to dataurl at 3 times the size and crop to the active area
    console.log('this.canvas: ', this.canvas)
    const imgData = this.canvas.toDataURL({
      format: 'jpeg',
      quality: 1,
      multiplier: 3,
      left: 220,
      top: 80,
      width: 360,
      height: 640
    })
    const blob = this.dataURLToBlob(imgData)
    const objurl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objurl
    link.download = 'story.jpg'
    link.click()
    // Reset the clipping path to what it was
    this.canvas.clipTo = (ctx): void => {
      ctx.rect(220, 80, 360, 640)
    }
    // Reset overlay image
    this.canvas.setOverlayImage(require('~/assets/images/overlay-bg.png'), this.canvas.renderAll.bind(this.canvas), {
      opacity: 0.5,
      angle: 0,
      left: 0,
      top: 0,
      originX: 'left',
      originY: 'top',
      crossOrigin: 'anonymous'
    })
    this.canvas.renderAll()
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
      (imageF as any).scaleToHeight(300);

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
      }, { width: 200, height: 200, left: 150, top: 25 })
    }, { crossOrigin: 'anonymous' })
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
      this.clearCanvas()
      const videoId = this.getVideoId(this.inputVideo)
      const res = await this.$videoService.detail(videoId)
      const items = res.items[0]
      if (items) {
        console.log('items: ', items)
        // const image = items.snippet.thumbnails.standard.url + '?not-from-cache-please'
        let bg = this.getThumb(this.inputVideo)
        const checkImageMaxExist = await this.imageExists(bg)
        if (!checkImageMaxExist) {
          bg = this.getThumb(this.inputVideo, 'sd')
        }

        // const bg = image

        this.onAddImage(bg)
        this.addCenterImage(bg)

        const title = items.snippet.title
        const channelTitle = items.snippet.channelTitle

        this.addFabricTextbox(channelTitle, { fontSize: 12, top: 530, fill: '#eaeaea' })
        this.addFabricTextbox(title, { fontSize: 12, top: 500, })
      }
    } else {
      this.onLoginGoogle()
    }
  }

  clearCanvas () : void {
    console.log('this.canvas: ', this.canvas, this.canvas._objects)
    if (this.canvas._objects.length) {
      this.canvas.remove(...this.canvas.getObjects())
      this.canvas.renderAll()
    }
  }

  imageExists (imageUrl: string) : any {
    const http = new XMLHttpRequest()

    http.open('HEAD', imageUrl, false)
    http.send()

    return http.status !== 404
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

    if (size === 'sd') {
      return 'http://img.youtube.com/vi/' + video + '/sddefault.jpg'
    }
    return 'http://img.youtube.com/vi/' + video + '/maxresdefault.jpg'
  }
}
</script>
