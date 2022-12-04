import { createRouter, createWebHashHistory,  RouteRecordRaw } from 'vue-router'
// 1. 定义路由组件.
// 也可以从其他文件导入
const Login = ()=> import('../views/Login.vue')
const Home = ()=> import('../views/Home.vue')


// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
const routes = [
  { path: '/', component: Login, name:'login' },
  { path: '/home', component: Home, name: 'home' },
]

const router = createRouter({
    history: createWebHashHistory(),  
    routes
})

export default router