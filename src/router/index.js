import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/Home'
import StationDetail from '@/pages/StationDetail'
import ErrorList from '@/pages/ErrorList'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/',
    name: 'Home',
    component: Home
  }, {
    path: '*',
    redirect: '/'
  }, {
    path: '/StationDetail',
    name: 'StationDetail',
    component: StationDetail
  }, {
    path: '/ErrorList/:lineCode/:stationCode',
    name: 'ErrorList',
    component: ErrorList
  }]
})
