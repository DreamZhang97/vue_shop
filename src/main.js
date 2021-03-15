import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
// 引入axios
import axios from 'axios'
axios.defaults.baseURL = 'http://127.0.1:8000/api/private/v1'
// 发送请求之前 先做一个拦截 在请求头中添加一个字段
axios.interceptors.request.use((config) => {
  // console.log(config)
  // 在这个配置中 添加一个字段 y用来保存用户的信息
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // console.log(config)
  return config
})
Vue.prototype.$http = axios
Vue.config.productionTip = false
new Vue({
  router,
  render: (h) => h(App)
}).$mount('#app')
