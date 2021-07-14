/* eslint-disable space-before-function-paren */
/* eslint-disable no-void */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.Canvas2Video = void 0
const defaultOptions = {
  mimeType: 'video/webm;codecs=h264',
  outVideoType: 'mp4',
  transcodeOptions: '',
  concatDemuxerOptions: '-c:v copy -af apad -map 0:v -map 1:a -shortest'
}
class Canvas2Video {
  constructor(config) {
    this.config = Object.assign({}, defaultOptions, config)
  }

  /**
   * start to record canvas stream
   */
  startRecord() {
    const deferred = {}
    deferred.promise = new Promise((resolve, reject) => {
      deferred.resolve = resolve
      deferred.reject = reject
    })
    this.deferred = deferred
    const stream = this.config.canvas.captureStream(60)
    const recorder = new MediaRecorder(stream, { mimeType: this.config.mimeType })
    const data = []
    recorder.ondataavailable = function (event) {
      if (event.data && event.data.size) {
        data.push(event.data)
      }
    }
    recorder.onstop = () => {
      this.deferred.resolve(new Blob(data, { type: this.config.mimeType }))
    }
    recorder.start()
    this.recorder = recorder
  }

  /**
   * stop to record canvas stream
   */
  stopRecord() {
    this.recorder.stop()
  }

  /**
   * merge audio and convert video type
   * @param url
   */
  async convertVideo(blob) {
    const { audio, outVideoType, mimeType, workerOptions, transcodeOptions, concatDemuxerOptions } = this.config
    const { createFFmpeg, fetchFile } = window.FFmpeg
    const ffmpeg = createFFmpeg(workerOptions || {})
    await ffmpeg.load()
    const type = mimeType.split(';')[0].split('/')[1]
    const buffer = await blob.arrayBuffer()
    await ffmpeg.FS('writeFile', `video.${type}`, new Uint8Array(buffer))
    if (audio) {
      const audioData = await fetchFile(audio)
      const audioType = audio.split('.').pop()
      await ffmpeg.FS('writeFile', `1.${audioType}`, audioData)
      const items = concatDemuxerOptions.split(/\s+/).filter(item => item)
      await ffmpeg.run(...['-i', `video.${type}`, '-i', `1.${audioType}`, ...items, `out.${outVideoType}`])
    } else if (type !== outVideoType) {
      const items = transcodeOptions.split(/\s+/g).filter(item => item)
      await ffmpeg.run(...['-i', `video.${type}`, ...items, `out.${outVideoType}`])
    }
    const data = await ffmpeg.FS('readFile', `out.${outVideoType}`)
    const b = new Blob([data.buffer], { type: `video/${outVideoType}` })
    return URL.createObjectURL(b)
  }

  /**
   * get canvas stream url, created by URL.createObjectURL & Blob
   */
  async getStreamURL() {
    const blob = await this.deferred.promise
    const { mimeType, audio, outVideoType } = this.config
    const type = mimeType.split(';')[0].split('/')[1]
    if (type === outVideoType && !audio) {
      return URL.createObjectURL(blob)
    }
    if (!window.FFmpeg) {
      const err = new Error('please load FFmpeg script file like https://unpkg.com/@ffmpeg/ffmpeg@0.7.0/dist/ffmpeg.min.js')
      return Promise.reject(err)
    }
    return this.convertVideo(blob)
  }
}
exports.Canvas2Video = Canvas2Video
