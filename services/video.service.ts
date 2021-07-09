/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export interface VideoServiceInterface {
  detail: (id:string) => Promise<any>;
}
export default $axios => (): VideoServiceInterface => ({
  detail (id : string) {
    return $axios.$get(`/video/${id}`)
  },
})
