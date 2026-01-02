// docs/.vitepress/theme/index.ts
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { BoxCube, Card, Links, Pill } from '@theojs/lumen'
import imageViewer from 'vitepress-plugin-image-viewer'
import { useRoute } from 'vitepress'
import '@theojs/lumen/style'
import 'viewerjs/dist/viewer.min.css'
import './var.css'

const theme: Theme = {
  ...DefaultTheme,
  enhanceApp: ({ app }) => {
    app.component('Pill', Pill)
    app.component('Links', Links)
    app.component('Card', Card)
    app.component('BoxCube', BoxCube)
  },
  setup() {
    const route = useRoute()
    imageViewer(route)
  },
}

export default theme
