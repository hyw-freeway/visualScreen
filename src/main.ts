import { createApp } from 'vue'
import ElementPlus from 'element-plus'

// import 'element-plus/theme-chalk/dark/css-vars.css'
import './style.css'
import 'element-plus/dist/index.css'
import App from './App.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router/router'
import './utils/flexible'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
app.use(ElementPlus)
app.use(router)
app.mount('#app')
