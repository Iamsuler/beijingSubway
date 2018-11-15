// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import './app.scss'
import {get, post} from './libs/http.js'
import Global from './libs/global'
import 'element-ui/packages/theme-chalk/src/icon.scss'
import 'element-ui/packages/theme-chalk/src/pagination.scss'
import 'element-ui/packages/theme-chalk/src/date-picker.scss'
import 'element-ui/packages/theme-chalk/src/button.scss'
import 'element-ui/packages/theme-chalk/src/table.scss'
import 'babel-polyfill'

Vue.config.productionTip = false
Vue.prototype.$get = get
Vue.prototype.$post = post

Vue.use(Global)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
