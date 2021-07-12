import { Plugin } from '@nuxt/types'
import createRepository, { VideoServiceInterface } from '~/services/video.service'

declare module 'vue/types/vue' {
  interface Vue {
    $videoService: VideoServiceInterface
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $videoService: VideoServiceInterface
  }
  // nuxtContext.$myInjectedFunction
  interface Context {
    $videoService: VideoServiceInterface
  }
}

declare module 'vuex/types/index' {
  // this.$myInjectedFunction inside Vuex stores
  interface Store<S> {
    $videoService: VideoServiceInterface
  }
}

const myPlugin: Plugin = (context, inject) => {
  const repositoryWithAxios = createRepository(context.$youtubeApi)
  inject('videoService', repositoryWithAxios())
}

export default myPlugin
