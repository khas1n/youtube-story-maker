
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export interface VideoServiceInterface {
  processVideo: (url:string, duration: number, startTime : string) => Promise<any>;
  getVideoDetail: (url:string) => Promise<any>;
}
export default $axios => (): VideoServiceInterface => ({
  processVideo (url: string, duration: number, startTime = '00:01:00'): Promise<any> {
    const payload = {
      url,
      duration,
      startTime
    }
    return $axios.$post('youtube-process', payload)
  },
  getVideoDetail (url: string) {
    const payload = {
      url,
    }
    return $axios.$post('info-video', payload)
  }
})
