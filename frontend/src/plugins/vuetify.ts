/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Composables
import { createVuetify } from 'vuetify'
// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
   icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'cyberDark',
    themes: {
      cyberDark: {
        dark: true,
        colors: {
          background:  '#07071a',
          surface:     '#0f0f2e',
          primary:     '#00f5ff',
          secondary:   '#bf5af2',
          accent:      '#ff3b9a',
          success:     '#39ff14',
          warning:     '#ffcc00',
          error:       '#ff453a',
          info:        '#0a84ff',
        },
      },
    },
  },
})
