import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import User from '../components/Users/User.vue'
import Rights from '../components/powers/Rights'
import Roles from '../components/powers/Roles'
import Categories from '../components/goods/Categories'
import Params from '../components/goods/Params.vue'
import GoodsList from '../components/goods/List.vue'
import AddGoods from '../components/goods/AddGoods.vue'
import Order from '../components/order/Order.vue'
import Report from '../components/report/Report.vue'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

Vue.use(VueRouter)
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      { path: '/users', component: User },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Categories },
      { path: '/params', component: Params },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: AddGoods },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]
const router = new VueRouter({
  routes
})
// 导入进度条相关
// 在发送请求的时候就开始显示这个进度条 request
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  NProgress.start()
  if (to.path === '/login') return next()
  // 从session中获取token 根据token来判断是否存有数据
  const tokenstr = window.sessionStorage.getItem('token')
  // 找不到登录信息 也就是没有登录
  if (!tokenstr) return next('/login')
  // 不满足上述两个 也就是登录了，他么直接放行
  next()
})
// 进入后守卫
router.afterEach((to) => {
  NProgress.done()
})
export default router
