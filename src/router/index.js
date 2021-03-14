import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
Vue.use(VueRouter)
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home }
]
const router = new VueRouter({
  routes
})
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  // 从session中获取token 根据token来判断是否存有数据
  const tokenstr = window.sessionStorage.getItem('token')
  // 找不到登录信息 也就是没有登录
  if (!tokenstr) return next('/login')
  // 不满足上述两个 也就是登录了，他么直接放行
  next()
})
export default router
