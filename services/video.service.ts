/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { YoutubeVideosResponse } from '~/models/youtube.model'

/* eslint-disable @typescript-eslint/explicit-function-return-type */
export interface VideoServiceInterface {
  detail: (id:string) => Promise<YoutubeVideosResponse>;
}
export default $axios => (): VideoServiceInterface => ({
  detail (id : string) : Promise<YoutubeVideosResponse> {
    return $axios.$get(`?part=snippet%2CcontentDetails%2Cstatistics&id=${id}&key=${process.env.youtubeApiKey}`)
  },
})
