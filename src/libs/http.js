import axios from 'axios'

axios.defaults.timeout = 50000
// axios.defaults.baseURL = 'http://120.55.41.122:9111';
axios.defaults.headers['Content-type'] = 'application/json'

//http request 拦截器
axios.interceptors.request.use(
  config => {
    const token = sessionStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = 'Bearer ' + token
    }
    return config
  }, error => {
    return Promise.reject(err)
  }
)


//http response 拦截器
// axios.interceptors.response.use(
//   response => {
//     if(response.data.errCode ==2){
//       router.push({
//         path:"/login",
//         querry:{redirect:router.currentRoute.fullPath}//从哪个页面跳转
//       })
//     }
//     return response;
//   },
//   error => {
//     return Promise.reject(error)
//   }
// )


/**
 * 封装get方法
 * @param url
 * @param data
 * @returns {Promise}
 */

export function get (url, params = {}) {
  return new Promise((resolve, reject) => {
    axios.get(url, {
      params: params
    }).then(response => {
      resolve(response.data)
    }).catch(err => {
      reject(err)
    })
  })
}

/**
 * 封装post请求
 * @param url
 * @param data
 * @returns {Promise}
 */

export function post (url, data = {}) {
  return new Promise((resolve, reject) => {
    axios.post(`${process.env.ROOT_API}${url}`, data).then(response => {
      resolve(response.data)
    }, err => {
      reject(err)
    })
  })
}

 /**
 * 封装patch请求
 * @param url
 * @param data
 * @returns {Promise}
 */

// export function patch(url,data = {}){
//   return new Promise((resolve,reject) => {
//     axios.patch(url,data)
//          .then(response => {
//            resolve(response.data);
//          },err => {
//            reject(err)
//          })
//   })
// }

 /**
 * 封装put请求
 * @param url
 * @param data
 * @returns {Promise}
 */

// export function put(url,data = {}){
//   return new Promise((resolve,reject) => {
//     axios.put(url,data)
//          .then(response => {
//            resolve(response.data);
//          },err => {
//            reject(err)
//          })
//   })
// }
