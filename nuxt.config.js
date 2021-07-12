export default {
  ssr: false,
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'youtube-story-maker',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~assets/styles/main.scss'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~plugins/fabric.ts',
  ],

  auth: {
    strategies: {
      google: {
        scheme: 'oauth2',
        endpoints: {
          token: '/api/verification-google-code',
        },
        access_type: 'offline',
        // token_key: 'access_token',
        // access_token_endpoint: 'http://localhost:3005/verification-google-code',
        clientId: '390669399701-ohknul2qiu9ms6sce4ug5o0b21pk2kii.apps.googleusercontent.com',
        scope: ['https://www.googleapis.com/auth/youtube.readonly', 'openid', 'profile', 'email'],
        codeChallengeMethod: '',
        grantType: 'authorization_code',
        responseType: 'code',
        redirectUri: 'http://localhost:3000',
      },
    },
    redirect: {
      login: '/api/verification-google-code',
      logout: '/',
      callback: '/',
      home: '/'
    },
    localStorage: false,
    plugins: [{ src: '~/plugins/axios.ts' }, '~plugins/api-services.ts']
  },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    'bootstrap-vue/nuxt',
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    '@nuxtjs/auth-next',
    '@nuxtjs/proxy'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  proxy: {
    '/api/': {
      target: 'http://localhost:3005/',
      pathRewrite: { '^/api/': '' },
    },
    '/youtube/v3/videos': {
      target: 'https://youtube.googleapis.com',
      secure: true,
      logLevel: 'debug',
      changeOrigin: true
    }
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en'
    }
  },

  middleware: ['auth'],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  },
  env: {
    youtubeApiUrl: process.env.youtubeApiUrl,
    youtubeApiKey: process.env.youtubeApiKey,
  }
}
