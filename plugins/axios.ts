/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
import { Plugin } from '@nuxt/types'

declare module 'vue/types/vue' {
  // this.$myInjectedFunction inside Vue components
  interface Vue {
    $youtubeApi(): void
    $api(): void
  }
}

declare module '@nuxt/types' {
  // nuxtContext.app.$myInjectedFunction inside asyncData, fetch, plugins, middleware, nuxtServerInit
  interface NuxtAppOptions {
    $youtubeApi(): void
    $api(): void
  }
  // nuxtContext.$myInjectedFunction
  interface Context {
    $youtubeApi(): void
    $api(): void
  }
}

declare module 'vuex/types/index' {
  // this.$myInjectedFunction inside Vuex stores
  interface Store<S> {
    $youtubeApi(): void
    $api(): void
  }
}

const myPlugin: Plugin = ({ $axios, $auth }, inject) => {
  const youtubeApi = $axios.create()
  const token = ($auth.strategy as any).token
  youtubeApi.setBaseURL(process.env.youtubeApiUrl as string)
  if (token) {
    console.log('youtubeApi: ', youtubeApi, token.get(), process.env.youtubeApiUrl)
    youtubeApi.setHeader('Authorization', token.get())
  }
  inject('youtubeApi', youtubeApi)

  const api = $axios.create()
  api.setBaseURL(process.env.api as string)
  inject('api', api)
}

export default myPlugin
