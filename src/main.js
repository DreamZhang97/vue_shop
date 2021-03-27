import Vue from 'vue'
import App from './App.vue'
import router from './router'
import TreeTable from 'vue-table-with-tree-grid'
import './plugins/element.js'
import './assets/css/global.css'
import { getToken } from './utils/token'
// 引入axios
import axios from 'axios'
// 引入vue-quiil-editor富文本
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 在请求得到响应之后 关闭进度条  response
// axios.defaults.baseURL = 'http://127.0.1:8000/api/private/v1'
// axios.defaults.baseURL = 'http://127.0.1/shop/api/private/v1'
axios.defaults.baseURL = 'https://xuanqb.top/shop-api/private/v1'
// 发送请求之前 先做一个拦截 在请求头中添加一个字段
axios.interceptors.request.use((config) => {
  // console.log(config)
  // 在这个配置中 添加一个字段 y用来保存用户的信息
  config.headers.Authorization = getToken()
  // console.log(config)
  return config
})
// 请求 完毕之后 关闭进度条
axios.interceptors.response.use((config) => {
  return config
})
Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.component('tree-table', TreeTable)
// 将富文本编辑器，注册为全局可用组件
Vue.use(VueQuillEditor)

// 制作一个时间过滤器
Vue.filter('dateFormate', (originVal) => {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
