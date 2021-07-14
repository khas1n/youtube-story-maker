
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export interface VideoServiceInterface {
  processVideo: (url:string) => Promise<any>;
}
export default $axios => (): VideoServiceInterface => ({
  processVideo (url: string): Promise<any> {
    const payload = {
      url
    }
    return $axios.$post('youtube-process', payload)
  },
})
