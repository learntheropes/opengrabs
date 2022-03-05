import path from 'path'
import fs from 'fs'

export default {
  // Target: https://go.nuxtjs.dev/config-target
  ssr: false,
  target: 'server',

  loading: { color: '#7957d5' },

  env: {
    BTC_CHAIN: process.env.BTC_CHAIN,
    URL: process.env.URL,
    AUTH0_TENANT: process.env.AUTH0_TENANT,
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY
  },

  head() {
    return this.$nuxtI18nHead({ addSeoAttributes: true })
  },

  // Global page headers: https://go.nuxtjs.dev/config-headproducts
  head: {
    titleTemplate: '%s | OpenGrabs',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    'vue-json-pretty/lib/styles.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/width.client.js',
    '~/plugins/db.js',
    '~/plugins/user.js',
    '~/plugins/feedback.js',
    '~/plugins/ticket.js',
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
        path  : '~/components/content',
        prefix: 'Content'
      },
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
        path  : '~/components/account/travels',
        prefix: 'AccountTravels'
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
    '@nuxtjs/moment'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    'nuxt-buefy',
    '@nuxtjs/axios',
    '@nuxtjs/dotenv',
    '@nuxtjs/auth-next',
    '@nuxtjs/google-analytics',
    ['nuxt-cookie-control', {
      colors:{
        barBackground: '#7957d5',
        modalButtonBackground: '#7957d5',
        barButtonHoverBackground: '#BCABEA',
        modalButtonHoverBackground: '#BCABEA', // #6045aa
        checkboxDisabledBackground: '#BCABEA',
        checkboxActiveBackground: '#7957d5',
        checkboxInactiveBackground: '#7957d5'
      },
      controlButton: false,
      locales: ['en', 'es', 'pt', 'ru'],
      text: {
        locale: {
          en: {
            barDescription: 'We use our own cookies and third-party cookies so that we can show you this website and better understand how you use it, with a view to improving the services we offer.',
          },
          es: {
            barDescription: 'Utilizamos cookies propias y de terceros para poder mostrarle una página web y comprender cómo la utiliza, con el fin de mejorar los servicios que ofrecemos.',
          },
          pt: {
            barDescription: 'Nós utilizamos os nossos próprios cookies e de terceiros para que possamos lhe mostrar este site e compreender a forma como o utiliza, de forma a melhorarmos os serviços que oferecemos.'
          },
          ru: {
            barDescription: 'Мы используем наши собственные файлы cookie и сторонние файлы cookie, чтобы мы могли показать вам этот веб-сайт и лучше понять, как вы его используете, с целью улучшения предлагаемых нами услуг.'
          }
        }
      }
    }]
  ],

  cookies: {
    necessary: [
      {
        name: {
          en: "Default cookies",
        },
        description: {
          en: "Used for cookie control, authentication and language setting."
        },
        cookies: [
          "cookie_control_consent",
          "cookie_control_enabled_cookies",
          "auth._refresh_token_expiration.auth0",
          "auth._refresh_token.auth0",
          "auth.strategy",
          "auth._token.auth0",
          "auth._token_expiration.auth0",
          "i18n_lang"
        ]
      },

    ],
    optional: [
      {
        name: {
          en: "Google Analytics",
        },
        description: {
          en: "Google Analytics is a web analytics service offered by Google that tracks and reports website traffic.",
        },
        identifier: 'ga',
        cookies: [
          "_ga",
          "_gat",
          "_gid"
        ],
        // https://stackoverflow.com/questions/64360036/how-to-control-google-analytics-tracking-in-nuxt-based-on-consent-cookies
        accepted: () => {
          window.$nuxt.$ga.enable()
          window.$nuxt.$ga.page(window.$nuxt.$route.path)
        },
        declined: () => {
          window.$nuxt.$cookies.remove('ga')
        }
      }
    ]
  },

  i18n: {
    baseUrl: process.env.URL,
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        file: 'en.js',
        name: 'English'
      },
      {
        code: 'es',
        iso: 'es-AR',
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

  sitemap: {
    hostname: `https://${process.env.URL||'testnet.opengrabs.com'}`,
    i18n: true,
    exclude: [
      '/cb',
      '/admin',
      '/admin/**'
    ]
  },

  // https://stackoverflow.com/questions/56966137/how-to-run-nuxt-npm-run-dev-with-https-in-localhost
  axios: {
    debug: (process.env.URL) ? false : true,
    baseURL: (process.env.URL) ? `https://${process.env.URL}` : 'https://localhost:3000',
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
        logoutRedirectUri: (process.env.URL) ? `https://${process.env.URL}` : 'https://localhost:3000'
      }
    },
    plugins: [
      '~/plugins/auth.js',
      { src: '~/plugins/watchState.js', mode: 'client' }
    ]
  },

  googleAnalytics: {
    id: process.env.GOOGLE_ANALYTICS_ID,
    disabled: true,
  },

  router: {
    middleware: [
      'auth'
    ]
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

