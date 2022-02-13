import path from 'path'
import fs from 'fs'

export default {
  // Target: https://go.nuxtjs.dev/config-target
  ssr: false,
  target: 'server',

  env: {
    BTC_CHAIN: process.env.BTC_CHAIN,
    URL: process.env.URL,
    AUTH0_TENANT: process.env.AUTH0_TENANT
  },

  // Global page headers: https://go.nuxtjs.dev/config-headproducts
  head: {
    title: 'OpenGrabs',
    htmlAttrs: {
      lang: 'en',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    'vue-json-pretty/lib/styles.css'
  ],

  // https://nuxtjs.org/docs/configuration-glossary/configuration-vue-config/
  // vue: {
  //   config: {
  //     devtools: true
  //   }
  // },

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/tawk.client.js',
    '~/plugins/db.js',
    '~/plugins/user.js',
    '~/plugins/feedback.js',
    '~/plugins/admin.js',
    '~/plugins/utils.js',
    '~/plugins/vue-qrcode.js',
    '~/plugins/grab-actions.js',
    '~/plugins/travel-actions.js',
    '~/plugins/moment.js',
    '~/plugins/vue-json-pretty'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: {
    dirs: [
      '~/components',
      {
        path  : '~/components/layout',
        prefix: 'Layout'
      },
      {
        path  : '~/components/account/new',
        prefix: 'AccountNew'
      },
      {
        path  : '~/components/account/orders',
        prefix: 'AccountOrders'
      },
      {
        path  : '~/components/account/deliveries',
        prefix: 'AccountDeliveries'
      },
      {
        path  : '~/components/admin',
        prefix: 'Admin'
      }
    ]
  },

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    '@nuxtjs/moment',
    '@nuxtjs/google-analytics',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/i18n',
    'nuxt-buefy',
    '@nuxtjs/axios',
    '@nuxtjs/dotenv',
    '@nuxtjs/auth-next'
  ],

  i18n: {
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        file: 'en.js',
        name: 'English'
      },
      {
        code: 'es',
        iso: 'es-ES',
        file: 'es.js',
        name: 'Español'
      }
    ],
    defaultLocale: 'en',
    detectBrowserLanguage: {
      cookieKey: 'i18n_lang',
      fallbackLocale: 'en'
    },
    vuex: {
      moduleName: 'i18n',
      syncRouteParams: true
    },
    strategy: 'prefix',
    lazy: true,
    langDir: 'lang/',
    seo: false
  },

  // https://stackoverflow.com/questions/56966137/how-to-run-nuxt-npm-run-dev-with-https-in-localhost
  axios: {
    debug: (process.env.URL) ? false : true,
    baseURL: (process.env.URL) ? process.env.URL : 'https://localhost:3000',
    https: true,
    proxyHeaders: true
  },

  auth: {
    redirect: {
      callback: '/cb/',
      home: '/'
    },
    strategies: {
      auth0: {
        domain: `${process.env.AUTH0_TENANT}.us.auth0.com`,
        clientId: process.env.AUTH0_CLIENT_ID,
        audience: `https://${process.env.AUTH0_TENANT}.us.auth0.com/api/v2/`,
        scope: ['openid', 'profile', 'offline_access', 'email'],
        accessType: 'offline',
        responseType: 'code',
        grantType: 'authorization_code',
        codeChallengeMethod: 'S256',
        rewriteRedirects: true,
        logoutRedirectUri: (process.env.URL) ? `${process.env.URL}` : 'https://localhost:3000'
      }
    },
    plugins: [
      '~/plugins/auth.js',
      { src: '~/plugins/watchState.js', mode: 'client' }
    ]
  },

  googleAnalytics: {
    id: process.env.GOOGLE_ANALYTICS_ID,
  }

  router: {
    middleware: ['auth']
  },
  // https://stackoverflow.com/questions/55856117/using-timezones-with-nuxtjs-moment/57022505
  moment: {
    timezone: true,
    locales: ['es', 'pt', 'ru']
  },

  serverMiddleware: [
    // https://stackoverflow.com/questions/56629722/redirect-all-routes-to-https-in-nuxt-project-hosted-in-heroku
    'redirect-ssl',
    { path: '/api', handler: '~/api/index.js' }
  ],

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    postcss: {
      preset: {
        features: {
          customProperties: false
        }
      }
    },
    
    extend(config, { isDev, isClient }) {
      // https://github.com/nuxt-community/dotenv-module/issues/11#issuecomment-376780588
      config.node = {
        fs: 'empty'
      }
    }
  },

  // To use https on localhost:3000
  // https://stackoverflow.com/questions/56966137/how-to-run-nuxt-npm-run-dev-with-https-in-localhost
  server: process.env.NODE_ENV !== 'production' ? {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
      cert: fs.readFileSync(path.resolve(__dirname, 'server.crt'))
    }
  } : {}
}

