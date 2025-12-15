// docs/.vitepress/theme/index.ts
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { BoxCube, Card, Links, Pill } from '@theojs/lumen'
import mediumZoom from 'medium-zoom'
import '@theojs/lumen/style'
import './var.css'

const theme: Theme = {
  ...DefaultTheme,
  enhanceApp: ({ app, router }) => {
    app.component('Pill', Pill)
    app.component('Links', Links)
    app.component('Card', Card)
    app.component('BoxCube', BoxCube)

    // 初始化图片放大（进入页面和路由切换后）
    const initZoom = () => mediumZoom('.vp-doc img', { background: 'rgba(0,0,0,0.6)' })
    router.onAfterRouteChanged = () => initZoom()
    initZoom()
  },
}

export default theme
