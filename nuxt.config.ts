const onDevelopment = process.env.NODE_ENV === "development"

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  ssr: false,
  runtimeConfig: {
    public: {
      timezone: process.env.TZ!,
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY!,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN!,
        databaseURL: process.env.FIREBASE_DATABASE_URL!,
        projectId: process.env.FIREBASE_PROJECT_ID!,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET!,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID!,
        appId: process.env.FIREBASE_APP_ID!,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID!,
      },
      apiBaseURL: process.env.API_BASE_URL!,
    }
  },
  webpack: { optimizeCSS: true },
  build: {
    transpile: ['vuetify'],
  },
  css: [
    '@mdi/font/css/materialdesignicons.min.css',
    '~/public/css/main.css',
  ],
  postcss: {
    plugins: {
      'postcss-import': {},
      'tailwindcss/nesting': require('postcss-nesting'),
      tailwindcss: {},
      autoprefixer: {},
    }
  },
  app: {
    head: {
      title: '一同打羽球',
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        onDevelopment ? {} : { "http-equiv": "Content-Security-Policy", content: "upgrade-insecure-requests" },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          href: 'https://firebasestorage.googleapis.com/v0/b/boyholic-badminton.appspot.com/o/assets%2Fimages%2Ffavicon.png?alt=media&token=7f431ff0-5d76-40e3-9bdf-6710e5d3406a&_gl=1*1vj5kim*_ga*MjA1MzE4MjMxMi4xNjk1ODExMTAy*_ga_CW55HF8NVT*MTY5NjUwMDIwOS4yMi4xLjE2OTY1MDI4NDEuMjYuMC4w',
        },
      ],
    },
  },
})
