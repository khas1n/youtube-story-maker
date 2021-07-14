import { Plugin } from '@nuxt/types'
import createRepositoryVideo, { VideoServiceInterface } from '~/services/video.service'
import createRepositoryYoutube, { YoutubeServiceInterface } from '~/services/youtube.service'

declare module 'vue/types/vue' {
  interface Vue {
    $videoService: VideoServiceInterface,
    $youtubeService: YoutubeServiceInterface,
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $videoService: VideoServiceInterface,
    $youtubeService: YoutubeServiceInterface,
  }
  // nuxtContext.$myInjectedFunction
  interface Context {
    $videoService: VideoServiceInterface,
    $youtubeService: YoutubeServiceInterface,
  }
}

declare module 'vuex/types/index' {
  // this.$myInjectedFunction inside Vuex stores
  interface Store<S> {
    $videoService: VideoServiceInterface,
    $youtubeService: YoutubeServiceInterface,
  }
}

const myPlugin: Plugin = (context, inject) => {
  const repositoryYoutubeWithAxios = createRepositoryYoutube(context.$youtubeApi)
  inject('youtubeService', repositoryYoutubeWithAxios())

  const repositoryApiWithAxios = createRepositoryVideo(context.$api)
  inject('videoService', repositoryApiWithAxios())
}

export default myPlugin
