
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export interface VideoServiceInterface {
  processVideo: (url:string, duration: number) => Promise<any>;
  getVideoDetail: (url:string) => Promise<any>;
}
export default $axios => (): VideoServiceInterface => ({
  processVideo (url: string, duration : number): Promise<any> {
    const payload = {
      url,
      duration
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
