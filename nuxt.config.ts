// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],

  // The Supabase session lives in browser storage, so the dashboard renders
  // client-side. That also lets the `auth` route middleware run on a direct
  // visit — during SSR it would be skipped and the guard would never fire.
  routeRules: {
    '/dashboard': { ssr: false },
  },

  // Env names match the original Vercel deployment so existing project
  // variables keep working; NUXT_* equivalents override them at runtime.
  runtimeConfig: {
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    adminPassword: process.env.ADMIN_PASSWORD || '',
    public: {
      supabaseUrl: process.env.SUPABASE_URL || 'https://knctohwxfytzjuonrmqx.supabase.co',
      supabaseAnonKey:
        process.env.SUPABASE_ANON_KEY
        || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuY3RvaHd4Znl0emp1b25ybXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MTE2MzQsImV4cCI6MjEwNDM4NzYzNH0.-kOQXzSkdK7lEmOF5QPJ6kbINeGDzB9Jw4XNkexM_CM',
    },
  },

  app: {
    head: {
      title: 'Pledge Points',
      htmlAttrs: { lang: 'en' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#c5c6e8' },
        { name: 'description', content: 'Live leaderboard and recent activity.' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Julius+Sans+One&display=swap',
        },
      ],
    },
  },
})
