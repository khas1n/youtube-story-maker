<template>
  <div>
    <b-navbar variant="dark" type="dark">
      <b-navbar-brand href="#">
        Youtube Story maker
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
    <div class="container-fluid">
      <div class="row">
        <div class="col-lg-2">
          <div class="p-5">
            <b-form-group v-slot="{ ariaDescribedby }" label="Background Overlay" class="mb-5">
              <b-form-radio-group
                id="radio-group-1"
                v-model="selectedOverlay"
                :options="optionsOverlay"
                :aria-describedby="ariaDescribedby"
                name="radio-options"
              />
            </b-form-group>
            <b-button type="button" variant="primary" @click="onDownload">
              Download
            </b-button>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="editor d-flex align-items-center justify-content-center">
            <canvas id="c" width="360" height="640" />
            <video v-if="videoOverlayUrl" id="video1" width="1280" height="720" style="display:none">
              <source :src="videoOverlayUrl">
              <!-- <source :src="require('~/video/ex-vid.mp4')"> -->
            </video>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-var-requires */
import { Vue, Component } from 'vue-property-decorator'
import { fabric } from 'fabric'
import { Canvas2Video } from 'canvas2video'

@Component
export default class IndexComponent extends Vue {
  inputVideo = 'https://www.youtube.com/watch?v=v4pi1LxuDHc';
  canvas : any;
  textbox: any;
  image : any;
  centerImage: any;

  selectedOverlay = 'image';
  optionsOverlay = [{ text: 'Video', value: 'video' }, { text: 'Image', value: 'image' }]

  videoOverlayUrl = '';

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

    this.canvas.controlsAboveOverlay = true;
    (fabric as any).CustomVideo = fabric.util.createClass(fabric.Image, {
      type: 'customvideo',
      cropRect: null,

      initialize (video, options) {
        const defaultOpts = {
          lockRotation: true,
          objectCaching: true,
          cacheProperties: ['time']
        }
        options = options || {}

        this.callSuper('initialize', video,
          Object.assign({}, defaultOpts, options))
      },
      _draw (video, ctx, w, h) {
        const c = this.cropRect
        const d = {
          x: -this.width / 2,
          y: -this.height / 2,
          w: this.width,
          h: this.height
        }
        if (c) {
          ctx.drawImage(video, c.x, c.y, c.w, c.h, d.x, d.y, d.w, d.h)
        } else {
          ctx.drawImage(video, d.x, d.y, d.w, d.h)
        }
      },

      _render (ctx) {
        // console.log('rendered', this.cropLeft)
        this._draw(this.getElement(), ctx)
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  addFabricTextbox (title = '', option : object = {}) : void {
    const optionDefault = {
      left: 20,
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

  onDownload () : void {
    if (this.selectedOverlay === 'image') {
      this.onDownloadImage()
    } else if (this.selectedOverlay === 'video') {
      this.onDownloadVideo()
    }
  }

  onDownloadVideo () : void {
    this.startRecording()
  }

  onDownloadImage (): void {
    this.canvas.overlayImage = null
    this.canvas.renderAll.bind(this.canvas)
    // Remove canvas clipping so export the image
    this.canvas.clipTo = null
    // Export the canvas to dataurl at 3 times the size and crop to the active area

    const imgData = this.canvas.toDataURL({
      format: 'jpeg',
      quality: 1,
      multiplier: 3,
      left: 0,
      top: 0,
      width: 360,
      height: 640
    })
    const blob = this.dataURLToBlob(imgData)
    const objurl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objurl
    link.download = 'story.jpg'
    link.click()
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
        this.centerImage.top = 200

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

  startRecording ():void {
    const canvas2videoInstance = new Canvas2Video({
      canvas: document.getElementById('c') as HTMLCanvasElement,
      outVideoType: 'mp4',
      audio: this.videoOverlayUrl,
      // audio: require('~/video/mtf7hC17IBM.mp4'),
      workerOptions: {
        logger: ({ message } : any) :void => console.log(message),
        corePath: 'https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js'
      }
    })
    const video1El = document.getElementById('video1') as HTMLVideoElement
    video1El.currentTime = 0
    canvas2videoInstance.startRecord()

    setTimeout(() => {
      canvas2videoInstance.stopRecord()
    }, 15000)

    canvas2videoInstance
      .getStreamURL()
      .then((url) => {
        // const vid = document.createElement('video')
        // vid.src = url
        // vid.controls = true
        // document.body.appendChild(vid)
        const a = document.createElement('a')
        a.download = 'story.mp4'
        a.href = url
        a.click()
      })
      .catch(err => console.error(err))
  }

  addVideo ():void {
    const video1El = document.getElementById('video1') as HTMLVideoElement
    console.log('video1El: ', video1El)
    const video1 = new (fabric as any).CustomVideo(video1El, {
      left: 0,
      top: 0,
      height: 640,
      originX: 'center',
      originY: 'center',
      selectable: true,
      borderColor: 'red',
      cornerColor: 'green',
      cornerSize: 12,
      transparentCorners: false,
      objectCaching: false,
    })
    video1.scaleToHeight(640)
    this.canvas.add(video1)
    this.canvas.centerObject(video1)
    this.canvas.moveTo(video1, 0)
    video1El.loop = true
    video1El.muted = false;
    (video1.getElement() as HTMLVideoElement).play()
    const canvas = this.canvas
    fabric.util.requestAnimFrame(function render () {
      canvas.renderAll()
      fabric.util.requestAnimFrame(render)
    })
  }

  async onSubmit (): Promise<void> {
    if (this.$auth.loggedIn) {
      this.clearCanvas()
      const videoId = this.getVideoId(this.inputVideo)
      const res = await this.$youtubeService.detail(videoId)
      const items = res.items[0]
      if (items) {
        // const image = items.snippet.thumbnails.standard.url + '?not-from-cache-please'
        let bg = this.getThumb(this.inputVideo)
        const checkImageMaxExist = await this.imageExists(bg)
        if (!checkImageMaxExist) {
          bg = this.getThumb(this.inputVideo, 'sd')
        }

        // const bg = image
        if (this.selectedOverlay === 'video') {
          await this.$videoService.processVideo(this.inputVideo)
          this.videoOverlayUrl = `${process.env.api}video/${videoId}.mp4`
          setTimeout(() => {
            this.addVideo()
          }, 500)
        } else if (this.selectedOverlay === 'image') {
          this.onAddImage(bg)
        }
        this.addCenterImage(bg)

        const title = items.snippet.title
        const channelTitle = items.snippet.channelTitle

        this.addFabricTextbox(channelTitle, { fontSize: 12, top: 455, fill: '#eaeaea' })
        this.addFabricTextbox(title, { fontSize: 12, top: 425, })
      }
    } else {
      this.onLoginGoogle()
    }
  }

  clearCanvas () : void {
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
